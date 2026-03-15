# 创建学生管理系统
from typing import List, Dict, Optional
from dataclasses import dataclass, field

@dataclass
class Student:
    """学生类 (使用 dataclass 自动生成 __init__, __repr__ 等)"""
    id: int
    name: str
    age: int
    grades: List[float] = field(default_factory=list)

    def add_grade(self, grade: float) -> None:
        """添加成绩"""
        self.grades.append(grade)

    def get_average(self) -> float:
        """计算平均分"""
        if not self.grades:
            return 0.0
        return sum(self.grades) / len(self.grades)

    def __str__(self) -> str:
        return f"Student({self.id}, {self.name}, {self.age})"

class StudentManager:
    """学生管理器"""

    def __init__(self):
        self.students: Dict[int, Student] = {}

    def add_student(self, student: Student) -> None:
        """添加学生"""
        self.students[student.id] = student

    def get_student(self, student_id: int) -> Optional[Student]:
        """获取学生"""
        return self.students.get(student_id)

    def get_all_students(self) -> List[Student]:
        """获取所有学生"""
        return list(self.students.values())

    def get_top_students(self, limit: int = 3) -> List[Student]:
        """获取优秀学生"""
        return sorted(
            self.get_all_students(),
            key=lambda s: s.get_average(),
            reverse=True
        )[:limit]

    def get_students_by_age_range(self, min_age: int, max_age: int) -> List[Student]:
        """按年龄范围获取学生"""
        return [
            student for student in self.get_all_students()
            if min_age <= student.age <= max_age
        ]

# 使用示例
manager = StudentManager()

student1 = Student(1, "张三", 20)
student1.add_grade(85)
student1.add_grade(90)

student2 = Student(2, "李四", 19)
student2.add_grade(92)
student2.add_grade(88)

manager.add_student(student1)
manager.add_student(student2)

print("所有学生:", manager.get_all_students())
print("优秀学生:", manager.get_top_students(2))
