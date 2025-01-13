from datetime import datetime
from app import create_app, db
from app.models import Student, Staff, Fee, Grade, Term, BusDestination, BoardingFee, Class, Payment
import random

def seed_data():
    # Seed term
    term1 = Term(
        name="Term 1 2025", start_date=datetime(2025, 1, 3), end_date=datetime(2025, 4, 4)
    )
    term2 = Term(
        name="Term 2 2025", start_date=datetime(2025, 5, 1), end_date=datetime(2025, 8, 4)
    )
    db.session.add_all([term1, term2])
    db.session.commit()
    print(f"Seeded terms: {term1.name}, {term2.name}")

    # Seed grades
    grades = {}
    grade_names = ["0", "21", "22", "1", "2", "3", "4"]
    for name in grade_names:
        grade = Grade(name=name)
        db.session.add(grade)
        grades[name] = grade
    db.session.commit()
    print("Seeded grades:", ", ".join(grade_names))

    # Seed fees for each term and grade
    term_fees = {
        "0": {term1.id: 6500, term2.id: 6700},
        "22": {term1.id: 7500, term2.id: 7700},
        "22": {term1.id: 6500, term2.id: 6700},
        "1": {term1.id: 7000, term2.id: 7200},
        "2": {term1.id: 5000, term2.id: 5200},
        "3": {term1.id: 6500, term2.id: 6700},
        "4": {term1.id: 6500, term2.id: 6700},
    }

    for grade_name, fee_data in term_fees.items():
        for term_id, amount in fee_data.items():
            fee = Fee(term_id=term_id, grade_id=grades[grade_name].id, amount=amount)
            db.session.add(fee)
    db.session.commit()
    print("Seeded fees for each term and grade.")

    # Seed bus destinations
    bus_destinations = [
        {"name": "Marangetit", "charge": 1200},
        {"name": "Olesoi", "charge": 1288},
        {"name": "Sigor", "charge": 1000},
    ]
    for destination in bus_destinations:
        db.session.add(BusDestination(name=destination["name"], charge=destination["charge"]))
    db.session.commit()
    print("Seeded bus destinations.")

    # Seed boarding fee
    boarding_fee = BoardingFee(extra_fee=4500)
    db.session.add(boarding_fee)
    db.session.commit()
    print("Seeded boarding fee.")

    # Seed teachers
    teacher_names = ["Teacher A", "Teacher B", "Teacher C", "Teacher D", "Teacher E", "Teacher F"]
    teachers = []
    for name in teacher_names:
        teacher = Staff(name=name, phone=f"0720{name[-1]}000", role="teacher")
        teacher.set_password("teacherpassword")
        db.session.add(teacher)
        teachers.append(teacher)
    db.session.commit()
    print("Seeded teachers.")

    # Seed classes and streams
    streams = ["blue", "green"]
    for grade_name, grade in grades.items():
        for stream in streams:
            class_name = f"{grade_name.capitalize()} - {stream.capitalize()}"
            teacher = random.choice(teachers)
            class_ = Class(name=class_name, grade_id=grade.id, staff_id=teacher.id)
            db.session.add(class_)
    db.session.commit()
    print("Seeded classes with streams.")

    # Seed students
    for grade_name, grade in grades.items():
        for stream in streams:
            for i in range(1, 6):  # 5 students per class
                student_name = f"{grade_name.capitalize()} {stream.capitalize()} Student {i}"
                student = Student(
                    name=student_name,
                    admission_number=f"ADM{grade.id}{stream[0]}{i:02d}",
                    grade_id=grade.id,
                    phone=f"07200000{i}",
                    term_fee=term_fees[grade_name][term1.id],
                    use_bus=random.choice([True, False]),
                    arrears=random.uniform(0, 1000),
                    bus_balance=random.uniform(0, 500)
                )
                student.set_password(f"ADM{grade.id}{stream[0]}{i:02d}")
                
                # Handle case where no payments have been made
                if not student.payments:  # assuming 'payments' is a related field
                    student.balance = 0  # default balance when no payment has been made
                else:
                    student.initialize_balance()  # your method to initialize balance if payments exist
                
                db.session.add(student)
    db.session.commit()
    print("Seeded students.")
    