from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from . import db

# Term model

class Term(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    fees = db.relationship('Fee', back_populates='term', lazy=True)
    bus_payments = db.relationship('BusPayment', back_populates='term', lazy=True)

    def __repr__(self):
        return f"<Term(name={self.name}, start_date={self.start_date}, end_date={self.end_date})>"
    @classmethod
    def get_active_term(cls):
        # Get the current date
        current_date = datetime.utcnow().date()
        return cls.query.filter(cls.start_date <= current_date, cls.end_date >= current_date).first()
    def to_dict(self):
        return {
        "id": self.id,
        "name": self.name,
        "start_date": self.start_date.isoformat(),
        "end_date": self.end_date.isoformat()
    }
    
    
# Staff model
class Staff(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    phone = db.Column(db.String(25), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    role = db.Column(db.String(50), nullable=False)

    classes = db.relationship('Class', back_populates='staff')

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

# Grade model for fee structure
class Grade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(10), nullable=False, unique=True)
    term_fees = db.relationship('Fee', back_populates='grade', lazy=True)
    

    
    def __repr__(self):
        return f"<Grade(name={self.name})>"
    def to_dict(self):
        return {
        "id": self.id,
        "name": self.name
    }
    

# Student model
class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    admission_number = db.Column(db.String(50), unique=True, nullable=False)
    grade_id = db.Column(db.Integer, db.ForeignKey('grade.id'), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    balance = db.Column(db.Float, default=0.0)
    arrears = db.Column(db.Float, default=0.0)
    prepayment = db.Column(db.Float, default=0.0)
    use_bus = db.Column(db.Boolean, nullable=False, default=False)
    bus_balance = db.Column(db.Float, default=0.0)
    is_boarding = db.Column(db.Boolean, nullable=False, default=False)
    password = db.Column(db.String(100), nullable=False)
    destination_id = db.Column(db.Integer, db.ForeignKey('bus_destination.id'))

    # Relationships
    grade = db.relationship('Grade', backref='students')
    bus_destination = db.relationship("BusDestination", back_populates="students")
    payments = db.relationship('Payment', backref='student', lazy=True)
    bus_payments = db.relationship('BusPayment', back_populates='student', lazy='dynamic')
    assignments = db.relationship('Assignment', backref='student', lazy=True)

    def set_password(self):
        """Set password to the admission number."""
        self.password = generate_password_hash(self.admission_number)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def initialize_balance(self, term_id):
        """Calculate initial balance for the term."""
        active_term = Term.get_active_term()
        if not active_term:
            self.balance = 0.0
            return
        fee = Fee.query.filter_by(grade_id=self.grade_id, term_id=active_term.id).first()
        if not fee:
            raise ValueError("Fee structure not set for this grade and term.")

        self.balance = fee.amount
        if self.is_boarding:
            boarding_fee = BoardingFee.query.first()
            if boarding_fee:
                self.balance += boarding_fee.extra_fee

        self.balance -= self.prepayment
        self.prepayment = 0
        db.session.commit()

    def update_payment(self, amount):
        """Update student balance, prepayment, and arrears for the current active term."""
        active_term = Term.get_active_term()
        if not active_term:
            raise ValueError("No active term found.")

        # Handle arrears first
        if self.arrears > 0:
            if amount >= self.arrears:
                amount -= self.arrears
                self.arrears = 0
            else:
                self.arrears -= amount
                db.session.commit()
                return  # Payment fully applied to arrears

        # Apply remaining amount to the current balance
        self.balance -= amount
        if self.balance < 0:
            self.prepayment = -self.balance  # Convert negative balance to prepayment
            self.balance = 0

        db.session.commit()

    def __repr__(self):
        return f"<Student(name={self.name}, balance={self.balance}, arrears={self.arrears})>"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "admission_number": self.admission_number,
            "grade_id": self.grade_id,
            "phone": self.phone,
            "balance": self.balance,
            "arrears": self.arrears,
            "prepayment": self.prepayment,
            "use_bus": self.use_bus,
            "bus_balance": self.bus_balance,
            "is_boarding": self.is_boarding,
            "destination_id": self.destination_id
        }
        
# Payment model
class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    method = db.Column(db.String(20), nullable=False)
    term_id = db.Column(db.Integer, db.ForeignKey('term.id'), nullable=False)
    description = db.Column(db.String(255), default="")
    balance_after_payment = db.Column(db.Float, nullable=False)

    def __init__(self, student_id, amount, method, term_id, description=""):
        self.student_id = student_id
        self.amount = amount
        self.method = method
        self.term_id = term_id
        self.description = description or ""

        student = Student.query.get(student_id)
        if student:
            student.update_payment(amount, term_id)
            self.balance_after_payment = student.balance

        db.session.commit()

    def __repr__(self):
        return f"<Payment(student_id={self.student_id}, amount={self.amount}, balance_after_payment={self.balance_after_payment})>"
    def to_dict(self):
        return {
        "id": self.id,
        "student_id": self.student_id,
        "amount": self.amount,
        "date": self.date.isoformat(),
        "method": self.method,
        "term_id": self.term_id,
        "description": self.description,
        "balance_after_payment": self.balance_after_payment
    }
    
       
# Fee model for each term and grade
class Fee(db.Model):
    __tablename__ = 'fees'

    id = db.Column(db.Integer, primary_key=True)
    term_id = db.Column(db.Integer, db.ForeignKey('term.id'), nullable=False)
    grade_id = db.Column(db.Integer, db.ForeignKey('grade.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)

    # Relationships
    term = db.relationship('Term', back_populates='fees')
    grade = db.relationship('Grade', back_populates='term_fees')

    def to_dict(self):
        """Convert fee object to dictionary for JSON responses."""
        return {
            "id": self.id,
            "term_id": self.term_id,
            "term_name": self.term.name,  # Access related term's name
            "grade_id": self.grade_id,
            "grade_name": self.grade.name,  # Access related grade's name
            "amount": self.amount
        }
    def get_fee_for_grade_and_term(grade_id, term_id):
        """Retrieve the fee amount for a specific grade and term."""
        fee = Fee.query.filter_by(grade_id=grade_id, term_id=term_id).first()
        if fee:
            return fee.amount
        return None

    def __repr__(self):
        return f"<Fee(term_id={self.term_id}, grade_id={self.grade_id}, amount={self.amount})>"


# Assignment model related to multiple students
class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    grade_id = db.Column(db.String(10), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.DateTime, nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)

    def __repr__(self):
        return f'<Assignment {self.title} for Grade {self.grade_id}>'
    def to_dict(self):
        return {
        "id": self.id,
        "title": self.title,
        "grade_id": self.grade_id,
        "description": self.description,
        "due_date": self.due_date.isoformat(),
        "student_id": self.student_id
    }
        

# Class model related to staff
class Class(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    grade_id = db.Column(db.Integer, db.ForeignKey('grade.id'), nullable=False)
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.id'), nullable=False)

    staff = db.relationship('Staff', back_populates='classes')
    grade = db.relationship('Grade', backref='classes')

    def __repr__(self):
        return f'<Class {self.name}>'
    def to_dict(self):
        return {
        "id": self.id,
        "name": self.name,
        "grade_id": self.grade_id,
        "staff_id": self.staff_id
    }
    

# Gallery model for images
class Gallery(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_url = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255))

    def __repr__(self):
        return f"<Gallery(image_url={self.image_url}, description={self.description})>"
    def to_dict(self):
        return {
        "id": self.id,
        "image_url": self.image_url,
        "description": self.description
    }
    

# Bus Destination model

class BusDestination(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    charge = db.Column(db.Float, nullable=False)
    students = db.relationship("Student", back_populates="bus_destination", lazy="dynamic")

    def __repr__(self):
        return f"<BusDestination(name={self.name}, charge={self.charge})>"
    def to_dict(self):
        return {
        "id": self.id,
        "name": self.name,
        "charge": self.charge
    }
    


class BusPayment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    term_id = db.Column(db.Integer, db.ForeignKey('term.id'), nullable=False)
    destination_id = db.Column(db.Integer, db.ForeignKey('bus_destination.id'))
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('Student', back_populates='bus_payments')
    term = db.relationship('Term', back_populates='bus_payments')
    destination = db.relationship('BusDestination', backref='payments')

    def __repr__(self):
        return f"<BusPayment(student_id={self.student_id}, term_id={self.term_id}, amount={self.amount})>"

    def to_dict(self):
        return {
        "id": self.id,
        "student_id": self.student_id,
        "term_id": self.term_id,
        "destination_id": self.destination_id,
        "amount": self.amount,
        "payment_date": self.payment_date.isoformat()
    }
    

    @staticmethod
    def create_payment(student_id, amount):
        # Fetch the current active term based on the current date
        current_term = Term.query.filter(
            Term.start_date <= datetime.utcnow(),
            Term.end_date >= datetime.utcnow()
        ).first()

        if not current_term:
            raise ValueError("No active term found to assign to the payment.")

        # Fetch the student's assigned destination
        student = Student.query.get(student_id)
        if not student or not student.destination_id:
            raise ValueError("Student does not have an assigned bus destination.")
            

        # Create a new bus payment
        payment = BusPayment(student_id=student_id, term_id=current_term.id, destination_id=student.destination_id, amount=amount)
    
        db.session.add(payment)
        db.session.commit()
        return payment
        
# Notifications model
class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Notification {self.id} - {self.message}>'
    def to_dict(self):
        return {
        "id": self.id,
        "message": self.message,
        "date": self.date.isoformat()
    }
    









# 