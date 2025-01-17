from flask import request, jsonify, Blueprint
from .models import db, Staff,  Student, Payment, Fee, BusPayment, BusDestination, Term, Gallery, Notification, Grade
from flask import current_app as app
import logging
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from app.jobs import process_term_rollover, promote_students

logging.basicConfig(level=logging.DEBUG)
routes = Blueprint('routes', __name__)

@routes.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        identifier = data.get('identifier')  # admission_number or name
        password = data.get('password')

        if not identifier or not password:
            return jsonify({"error": "Missing identifier or password"}), 400

        # Check if it's a student login
        student = Student.query.filter_by(admission_number=identifier).first()
        if student and student.check_password(password):
            return jsonify({"message": "Student login successful", "role": "student"}), 200

        # Check for staff login
        staff = Staff.query.filter_by(name=identifier).first()
        if staff and staff.check_password(password):
            return jsonify({"message": "Staff login successful", "role": staff.role}), 200

        # If no match is found
        return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        app.logger.error(f"Error during login: {e}")
        return jsonify({"error": "Internal server error"}), 500
    # return jsonify({"message": "Invalid credentials"}), 401
# Add/Register Student
@routes.route('/students', methods=['POST'])
def add_student():
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ["name", "admission_number", "grade_id", "phone"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required."}), 400

        # Check if admission_number is unique
        existing_student = Student.query.filter_by(admission_number=data["admission_number"]).first()
        if existing_student:
            return jsonify({"error": "Admission number already exists."}), 400

        # Fetch grade and validate
        grade = Grade.query.get(data["grade_id"])
        if not grade:
            return jsonify({"error": "Grade not found."}), 400

        # Create a new student (without password, balance-related fields will be set later)
        student = Student(
            name=data["name"],
            admission_number=data["admission_number"],
            grade_id=data["grade_id"],
            phone=data["phone"],
            is_boarding=data.get("is_boarding", False),
            use_bus=data.get("use_bus", False),
            bus_balance=data.get("bus_balance", 0.0),
            destination_id=data.get("destination_id")
        )

        # Set the password to be the admission number
        student.set_password(data["admission_number"])

        # Assign bus destination if 'use_bus' is True
        if data.get("use_bus", False):
            destination_id = data.get("destination_id")
            if not destination_id:
                return jsonify({"error": "Bus destination is required when 'use_bus' is True."}), 400

            # Fetch and assign the bus destination
            destination = BusDestination.query.get(destination_id)
            if not destination:
                return jsonify({"error": "Invalid bus destination."}), 400
            student.destination_id = destination.id

        # Fetch the active term
        active_term = Term.get_active_term()
        if not active_term:
            return jsonify({"error": "No active term found."}), 400

        # Initialize balance based on the current active term's fee
        try:
            student.initialize_balance(term_id=active_term.id)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        # Commit student to the database
        db.session.add(student)
        db.session.commit()

        return jsonify({"message": "Student added successfully", "student": student.id}), 201

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error adding student: {e}")
        return jsonify({"error": str(e)}), 500
        shel


@routes.route('/students', methods=['GET'])
def get_students():
    students = Student.query.all()
    # Serialize student data including necessary fields
    student_data = [
        {
            "id": student.id,
            "name": student.name,
            "grade": student.grade.name if student.grade else "N/A",
            "balance": student.balance
        }
        for student in students
    ]
    return jsonify(student_data)
    

# Update Student
@routes.route('/students/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404

    data = request.get_json()

    # Update fields
    if 'name' in data:
        student.name = data['name']
    if 'phone' in data:
        student.phone = data['phone']
    if 'use_bus' in data:
        student.use_bus = data['use_bus']
    if 'is_boarding' in data:
        student.is_boarding = data['is_boarding']

    # Reinitialize balance if necessary
    if 'is_boarding' in data or 'arrears' in data:
        student.arrears = data.get('arrears', student.arrears)
        student.initialize_balance()

    # Commit changes
    db.session.commit()
    return jsonify({"message": "Student updated successfully"}), 200


# Delete Student
@routes.route('/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404

    db.session.delete(student)
    db.session.commit()
    return jsonify({"message": "Student deleted successfully"}), 200


# Update Balance After Payment
    @routes.route('/students/<int:student_id>/update-balance', methods=['POST'])
    def update_balance(student_id):
        student = Student.query.get(student_id)
        if not student:
            return jsonify({"error": "Student not found"}), 404

        data = request.get_json()
        payment_amount = data.get('payment_amount')
        if not payment_amount or payment_amount <= 0:
            return jsonify({"error": "Valid payment amount is required"}), 400

        # Record the payment
        payment = Payment(student_id=student.id, amount=payment_amount, date=datetime.utcnow())
        db.session.add(payment)

        # Update student balance
        student.balance -= payment_amount
        if student.balance < 0:
            student.balance = 0

        db.session.commit()
        return jsonify({"message": "Student balance updated successfully"}), 200

    
    
@routes.route('/register_staff', methods=['POST'])
def register_staff():
    data = request.get_json()
    name = data['name']
    phone = data['phone']
    role = data['role']
    password = data.get('password', 'defaultpassword')  # Set default password if not provided
    
    staff = Staff(
        name=name,
        phone=phone,
        role=role,
    )
    staff.set_password(password)  # Set password using bcrypt
    db.session.add(staff)
    db.session.commit()
    
    return jsonify({"message": "Staff registered successfully"}), 201

@routes.route('/staff', methods=['GET'])
def get_staff():
    staff_members = Staff.query.all()
    return jsonify([{
        'id': staff.id,
        'name': staff.name,
        'phone': staff.phone,
        'role': staff.role,
        'password':staff.password
    } for staff in staff_members])

@routes.route('/delete_staff/<int:id>', methods=['DELETE'])
def delete_staff(id):
    staff = Staff.query.get_or_404(id)
    db.session.delete(staff)
    db.session.commit()
    
    return jsonify({"message": "Staff deleted successfully"}), 200

@routes.route('/students/<int:id>', methods=['GET'])
def get_student(id):
    student = Student.query.get(id)
    if student:
        return jsonify({
            'id': student.id,
            'name': student.name,
            'grade': student.grade,
            'balance': student.balance,
            'bus_balance': student.bus_balance,
            'is_boarding': student.is_boarding
        })
    return jsonify({"error": "Student not found"}), 404


# Add Payment
@routes.route('/payments', methods=['POST'])
def add_payment():
    data = request.get_json()
    try:
        student_id = data.get('student_id')
        amount = data.get('amount')
        method = data.get('method')
        term_id = data.get('term_id')
        description = data.get('description')

        if not all([student_id, amount, method, term_id]):
            return jsonify({"error": "Missing required fields"}), 400

        payment = Payment.record_payment(
            student_id=student_id,
            amount=amount,
            method=method,
            term_id=term_id,
            description=description,
        )
        return jsonify({"message": "Payment added successfully", "payment_id": payment.id}), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "An error occurred while adding payment", "details": str(e)}), 500

# Fetch all payments
@routes.route('/payments', methods=['GET'])
def get_all_payments():
    try:
        payments = Payment.query.all()  # Fetch all payments from the database
        if not payments:
            return jsonify({'message': 'No payments found'}), 404
        return jsonify([payment.to_dict() for payment in payments]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        
# Edit Payment
@routes.route('/payments/<int:payment_id>', methods=['PUT'])
def edit_payment(payment_id):
    data = request.get_json()
    try:
        payment = Payment.query.get(payment_id)
        if not payment:
            return jsonify({"error": "Payment not found"}), 404

        payment.amount = data.get('amount', payment.amount)
        payment.method = data.get('method', payment.method)
        payment.term_id = data.get('term_id', payment.term_id)
        payment.description = data.get('description', payment.description)

        db.session.commit()
        return jsonify({"message": "Payment updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": "An error occurred while updating payment", "details": str(e)}), 500


# Delete Payment
@routes.route('/payments/<int:payment_id>', methods=['DELETE'])
def delete_payment(payment_id):
    try:
        payment = Payment.query.get(payment_id)
        if not payment:
            return jsonify({"error": "Payment not found"}), 404

        db.session.delete(payment)
        db.session.commit()
        return jsonify({"message": "Payment deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": "An error occurred while deleting payment", "details": str(e)}), 500


# Get All Payments for a Student
@routes.route('/payments/student/<int:student_id>', methods=['GET'])
def get_payments_by_student(student_id):
    try:
        payments = Payment.query.filter_by(student_id=student_id).all()
        return jsonify([{
            "id": p.id,
            "amount": p.amount,
            "date": p.date,
            "method": p.method,
            "term_id": p.term_id,
            "balance_after_payment": p.balance_after_payment,
            "description": p.description,
            "notes": p.notes
        } for p in payments]), 200

    except Exception as e:
        return jsonify({"error": "An error occurred while fetching payments", "details": str(e)}), 500


# Get Payment by ID
@routes.route('/payments/<int:payment_id>', methods=['GET'])
def get_payment(payment_id):
    try:
        payment = Payment.query.get(payment_id)
        if not payment:
            return jsonify({"error": "Payment not found"}), 404

        return jsonify({
            "id": payment.id,
            "amount": payment.amount,
            "date": payment.date,
            "method": payment.method,
            "term_id": payment.term_id,
            "balance_after_payment": payment.balance_after_payment,
            "description": payment.description,
            "notes": payment.notes
        }), 200

    except Exception as e:
        return jsonify({"error": "An error occurred while fetching payment", "details": str(e)}), 500

@routes.route('/destinations', methods=['GET'])
def get_destinations():
    try:
        # Fetch all bus destinations
        destinations = BusDestination.query.all()

        # Check if there are any destinations
        if not destinations:
            return jsonify({"message": "No bus destinations found."}), 404

        # Return the bus destinations as a list
        return jsonify([destination.to_dict() for destination in destinations]), 200

    except Exception as e:
        app.logger.error(f"Error fetching bus destinations: {e}")
        return jsonify({"error": str(e)}), 500
        
@routes.route('/students/<int:student_id>/payments/term/<int:term_id>', methods=['GET'])
def get_student_payments_by_term(student_id, term_id):
    payments = Payment.query.filter_by(student_id=student_id).join(Fee).filter(Fee.term_id == term_id).all()
    return jsonify([
        {
            'id': payment.id,
            'amount': payment.amount,
            'date': payment.date,
            'method': payment.method
        }
        for payment in payments
    ])

@routes.route('/get_student_bus_destinations/<int:student_id>', methods=['GET'])
def get_student_bus_destinations(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404

    bus_destinations = student.bus_destinations  # Use the relationship to get bus destinations
    result = [{
        'bus_destination': destination.name,
        'charge': destination.charge
    } for destination in bus_destinations]

    return jsonify(result), 200

@routes.route('/term', methods=['POST'])
def create_term():
    data = request.get_json()
    name = data['name']
    start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
    end_date = datetime.strptime(data['end_date'], '%Y-%m-%d')

    term = Term(name=name, start_date=start_date, end_date=end_date)
    db.session.add(term)
    db.session.commit()
    
    return jsonify({"message": "Term created successfully", "term": {
        'id': term.id,
        'name': term.name,
        'start_date': term.start_date,
        'end_date': term.end_date
    }})

@routes.route('/terms', methods=['GET'])
def get_terms():
    terms = Term.query.all()
    return jsonify([{
        'id': term.id,
        'name': term.name,
        'start_date': term.start_date,
        'end_date': term.end_date
    } for term in terms])

@routes.route('/bus-payments', methods=['POST'])
def create_bus_payment():
    data = request.get_json()
    student_id = data['student_id']
    amount = data['amount']
    term_id = data['term_id']
    destination_id = data.get('destination_id', None)

    bus_payment = BusPayment(
        student_id=student_id,
        term_id=term_id,
        amount=amount,
        destination_id=destination_id
    )
    db.session.add(bus_payment)
    db.session.commit()

    # Update the student's bus balance
    bus_payment.update_student_bus_balance()

    return jsonify({
        'message': 'Bus payment created successfully',
        'bus_payment': {
            'student_id': student_id,
            'amount': amount,
            'payment_date': bus_payment.payment_date
        }
    })

@routes.route('/assign-student-to-bus', methods=['POST'])
def assign_student_to_bus():
    data = request.get_json()

    # Extract student ID and destination ID from the request
    student_id = data.get('student_id')
    destination_id = data.get('destination_id')

    # Validate student and destination existence
    student = Student.query.get(student_id)
    destination = BusDestination.query.get(destination_id)

    if not student:
        return jsonify({"error": "Student not found"}), 404

    if not destination:
        return jsonify({"error": "Bus destination not found"}), 404

    # Assign the bus destination to the student
    student.bus_destination_id = destination.id
    db.session.commit()

    return jsonify({
        "message": f"Student '{student.name}' assigned to destination '{destination.name}' successfully.",
        "student_id": student.id,
        "destination_id": destination.id
    })

@routes.route('/students-with-destinations', methods=['GET'])
def get_students_with_destinations():
    # Query all students
    students = Student.query.all()

    # Prepare a list of students with their destinations
    result = []
    for student in students:
        result.append({
            "student_id": student.id,
            "name": student.name,
            "admission_number": student.admission_number,
            "grade": student.grade.name if student.grade else None,
            "destination": {
                "id": student.bus_destination.id if student.bus_destination else None,
                "name": student.bus_destination.name if student.bus_destination else "No destination assigned",
                "charge": student.bus_destination.charge if student.bus_destination else None
            }
        })

    return jsonify(result)

@routes.route('/students-in-destination/<int:destination_id>', methods=['GET'])
def get_students_in_destination(destination_id):
    destination = BusDestination.query.get(destination_id)

    if not destination:
        return jsonify({"error": "Bus Destination not found"}), 404

    students = [
        {
            'id': student.id,
            'name': student.name,
            'admission_number': student.admission_number
        }
        for student in destination.students
    ]

    return jsonify({
        'destination': {
            'id': destination.id,
            'name': destination.name,
            'charge': destination.charge
        },
        'students': students
    })

@routes.route('/gallery', methods=['POST'])
def add_gallery_item():
    data = request.get_json()
    image_url = data['image_url']
    description = data.get('description', None)

    gallery_item = Gallery(image_url=image_url, description=description)
    db.session.add(gallery_item)
    db.session.commit()

    return jsonify({
        'message': 'Gallery item added successfully',
        'gallery_item': {
            'image_url': image_url,
            'description': description
        }
    })

@routes.route('/notifications', methods=['GET'])
def get_notifications():
    notifications = Notification.query.all()
    return jsonify([{
        'id': notification.id,
        'message': notification.message,
        'date': notification.date
    } for notification in notifications])

@routes.route('/notifications', methods=['POST'])
def add_notification():
    data = request.get_json()
    message = data['message']

    notification = Notification(message=message)
    db.session.add(notification)
    db.session.commit()

    return jsonify({
        'message': 'Notification added successfully',
        'notification': {
            'message': message,
            'date': notification.date
        }
    })

@routes.route('/process-rollover', methods=['POST'])
def process_rollover():
    success = process_term_rollover()  # Call the rollover function
    if success:
        return jsonify({"message": "Term rollover processed successfully"}), 200
    else:
        return jsonify({"message": "No term found to process rollover"}), 400

@routes.route('/promote-students', methods=['POST'])

def promote_students_route():
    promote_students()  # Call the function for student promotion
    return jsonify({"message": "students rollover was successfulll. congratulations 🎉"}),200

# Route to add a grade
@routes.route('/grades', methods=['POST'])
def add_grade():
    try:
        data = request.get_json()
        name = data.get('name')

        if not name:
            return jsonify({"error": "Grade name is required."}), 400

        # Check if the grade already exists
        existing_grade = Grade.query.filter_by(name=name).first()
        if existing_grade:
            return jsonify({"error": "Grade already exists."}), 400

        # Add new grade
        grade = Grade(name=name)
        db.session.add(grade)
        db.session.commit()

        return jsonify({"message": f"Grade '{name}' added successfully."}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Route to get all grades
@routes.route('/grades', methods=['GET'])
def get_grades():
    try:
        grades = Grade.query.all()
        grades_data = [{"id": grade.id, "grade": grade.name} for grade in grades]
        return jsonify(grades_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
@routes.route('/fees', methods=['POST'])
def add_fee():
    try:
        # Ensure JSON payload
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        # Log the incoming data
        print("Received data:", data)

        # Retrieve required fields
        term_id = data.get('term_id')
        grade_id = data.get('grade_id')
        amount = data.get('amount')

        # Validate fields
        if term_id is None or grade_id is None or amount is None:
            return jsonify({'error': 'Missing term_id, grade_id, or amount'}), 400

        # Query Term and Grade using their primary key (id)
        term = Term.query.get(term_id)  # Get term by id
        if not term:
            return jsonify({'error': f'Term with id {term_id} not found'}), 404

        grade = Grade.query.get(grade_id)  # Get grade by id
        if not grade:
            return jsonify({'error': f'Grade with id {grade_id} not found'}), 404

        # Create a new Fee entry
        fee = Fee(term_id=term_id, grade_id=grade_id, amount=amount)
        db.session.add(fee)
        db.session.commit()

        # Return the fee data
        return jsonify({'message': 'Fee added successfully!', 'fee': fee.to_dict()}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@routes.route('/fees/<int:term_id>/<int:grade_id>', methods=['GET'])
def get_fees_for_grade_in_term(term_id, grade_id):
    try:
        # Query the Fee for the specific term and grade
        fees = Fee.query.filter_by(term_id=term_id, grade_id=grade_id).all()

        if not fees:
            return jsonify({'message': f'No fees found for term {term_id} and grade {grade_id}'}), 404

        # Return the fee data
        return jsonify({'fees': [fee.to_dict() for fee in fees]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@routes.route('/fee-structure/<int:term_id>', methods=['GET'])
def generate_fee_structure_for_term(term_id):
    try:
        # Query all grades for the specific term and their associated fees
        fee_structure = db.session.query(Grade.name, db.func.sum(Fee.amount).label('total_fee')) \
            .join(Fee, Grade.id == Fee.grade_id) \
            .filter(Fee.term_id == term_id) \
            .group_by(Grade.name) \
            .all()

        if not fee_structure:
            return jsonify({'message': f'No fee structure found for term {term_id}'}), 404

        # Return the fee structure
        return jsonify({'fee_structure': [{'grade_name': grade_name, 'total_fee': total_fee} for grade_name, total_fee in fee_structure]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        