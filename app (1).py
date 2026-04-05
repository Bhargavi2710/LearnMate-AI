from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import google.generativeai as genai

app = Flask(__name__, static_folder=".", static_url_path="/")
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///learnmate.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

CORS(app)  # Allow CORS so frontend can call from anywhere

# 🔑 PUT YOUR GEMINI API KEY HERE
genai.configure(api_key="AIzaSyBgWPjWma0HAvBNWp2uwdYQQCl0Srdd9hE")

model = genai.GenerativeModel("gemini-2.5-flash")

# Serve the main HTML file if they hit the root
@app.route("/")
def index():
    return app.send_static_file("index.html")

# CHAT API
@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_msg = data.get("message", "")

    prompt = f"""
You are a helpful, expert AI teacher for a platform called LearnMate AI.
Your goal is to help students learning Python, C, and Java.

Explain clearly, simply, and step-by-step. Use Markdown formatting (like `code` blocks, **bolding**).
Keep it conversational but informative.

Student question:
{user_msg}
"""

    try:
        response = model.generate_content(prompt)
        return jsonify({"reply": response.text})
    except Exception as e:
        return jsonify({"reply": "AI not working", "error": str(e)}), 500

# EXPLANATION API
@app.route("/explain", methods=["POST"])
def explain():
    data = request.json
    topic = data.get("topic", "")

    try:
        simple_prompt = f"""
Explain the concept of "{topic}" in computer science/programming in very simple words for a beginner. 
Keep it to 2-3 short paragraphs. Use basic markdown.
"""

        detailed_prompt = f"""
Explain the concept of "{topic}" in computer science/programming in detail. 
Format using markdown syntax. Provide:
- **Definition**
- **Key points**
- **A Code Example** (if applicable)
- **Real-life use case**
"""

        simple = model.generate_content(simple_prompt)
        detailed = model.generate_content(detailed_prompt)

        return jsonify({
            "simple": simple.text,
            "detailed": detailed.text
        })
    except Exception as e:
        return jsonify({
            "simple": "Error connecting to AI.",
            "detailed": "Error connecting to AI.",
            "error": str(e)
        }), 500

# ================= DATABASE MODELS & API =================
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    desc = db.Column(db.String(200), nullable=False)
    subject = db.Column(db.String(50))
    date = db.Column(db.String(50))
    done = db.Column(db.Boolean, default=False)

class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(50))
    score = db.Column(db.Integer)
    total = db.Column(db.Integer)
    date = db.Column(db.String(50))

with app.app_context():
    db.create_all()

@app.route("/api/tasks", methods=["GET", "POST"])
def manage_tasks():
    if request.method == "POST":
        data = request.json
        new_task = Task(desc=data['desc'], subject=data.get('subject', 'General'), date=data.get('date', ''), done=data.get('done', False))
        db.session.add(new_task)
        db.session.commit()
        return jsonify({"id": new_task.id, "message": "Task added"})
    tasks = Task.query.all()
    return jsonify([{"id": t.id, "desc": t.desc, "subject": t.subject, "date": t.date, "done": t.done} for t in tasks])

@app.route("/api/tasks/<int:id>", methods=["PUT", "DELETE"])
def update_task(id):
    task = db.session.get(Task, id)
    if not task: return jsonify({"error": "not found"}), 404
    if request.method == "DELETE":
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted"})
    data = request.json
    if 'done' in data: task.done = data['done']
    db.session.commit()
    return jsonify({"message": "Task updated"})

@app.route("/api/scores", methods=["GET", "POST"])
def manage_scores():
    if request.method == "POST":
        data = request.json
        new_score = Score(subject=data['subject'], score=data['score'], total=data['total'], date=data.get('date', ''))
        db.session.add(new_score)
        db.session.commit()
        return jsonify({"id": new_score.id, "message": "Score added"})
    scores = Score.query.all()
    return jsonify([{"id": s.id, "subject": s.subject, "score": s.score, "total": s.total, "date": s.date} for s in scores])


if __name__ == "__main__":
    print("Starting LearnMate AI backend! Make sure you `pip install flask flask-cors google-generativeai` if you haven't.")
    app.run(debug=True, port=5000)