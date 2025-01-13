from app.models import db, Student, Fee, BusPayment, Term
from datetime import datetime

def process_term_rollover():
    # Fetch the current term
    current_term = Term.query.filter_by(end_date__lt=datetime.now()).order_by(Term.end_date.desc()).first()
    
    if current_term:
        # Update student balances for bus and fees after the current term ends
        students = Student.query.all()
        for student in students:
            # Update fee arrears
            fee_balance = Fee.query.filter_by(student_id=student.id).first()
            if fee_balance:
                fee_balance.arrears += fee_balance.amount_due
                fee_balance.amount_due = current_term.fee  # Set the new fee for the next term
                
            # Update bus payment arrears
            bus_payment_balance = BusPayment.query.filter_by(student_id=student.id).first()
            if bus_payment_balance:
                bus_payment_balance.arrears += bus_payment_balance.amount_due
                bus_payment_balance.amount_due = current_term.bus_fee  # Set new bus fee for the next term
            
            db.session.commit()
        
        # Remove any prepayments (if student paid excess amount last term)
        for student in students:
            student_balance = Fee.query.filter_by(student_id=student.id).first()
            if student_balance and student_balance.prepaid > 0:
                student_balance.prepaid = 0
                db.session.commit()

        return True  # Return success status
    else:
        return False  # No term found to process rollover


def promote_students():
    # Logic for promoting students to the next class after the year ends
    students = Student.query.all()
    
    for student in students:
        # Check current grade and promote the student
        if student.grade == 'baby':
            student.grade = 'pp1'
        elif student.grade == 'pp1':
            student.grade = 'pp2'
        elif student.grade == 'pp2':
            student.grade = '1'
        elif student.grade == '1':
            student.grade = '2'
        elif student.grade == '2':
            student.grade = '3'
        elif student.grade == '3':
            student.grade = '4'
        elif student.grade == '4':
            student.grade = '5'
        elif student.grade == '5':
            student.grade = '6'
        elif student.grade == '6':
            student.grade = '7'
        elif student.grade == '7':
            student.grade = '8'
        elif student.grade == '8':
            student.grade = '9'
        # Optionally add logic for handling cases when the student is in grade 9

        db.session.commit()  # Save the changes for each student
                
