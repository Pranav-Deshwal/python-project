"""
==============================================================================
CAMPUS LOST & FOUND — PYTHON BACKEND & WEB SERVER
Integrates all modules from manage.py, Management.py, Search&Claim_item.py,
report_found_item.py, and lost_item_reporting.py into a live HTTP service.
==============================================================================
"""

import http.server
import socketserver
import json
import os
import mimetypes
from urllib.parse import urlparse, parse_qs

HOST = "127.0.0.1"
PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ==============================================================================
# 1. IN-MEMORY DATA STORES (DIRECT FROM PYTHON USER SCRIPT)
# ==============================================================================

# From manage.py
users_db = {
    "pranav": {
        "password": "Pranav@230107",
        "role": "student",
        "name": "Pranav Deshwal",
        "student_id": "S26CSEU1917"
    },
    "security": {
        "password": "Security@123",
        "role": "staff",
        "name": "Security Desk Officer",
        "student_id": "STF-C11-09"
    },
    "admin": {
        "password": "Admin@230107",
        "role": "administrator",
        "name": "Campus Administrator",
        "student_id": "ADM-MAIN-01"
    }
}

ADMIN_SECRET_PASSWORDS = ("Pranav@230107", "pranav@230107")
ADMIN_SECRET_PASSWORD = "Pranav@230107"
MAX_USERNAME_LENGTH = 20
MIN_USERNAME_LENGTH = 3

def validate_password_policy(password: str) -> tuple:
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter (A-Z)."
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter (a-z)."
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number (0-9)."
    special_chars = "!@#$%^&*()_+-=[]{};':\"\\|,.<>/?`~"
    if not any(c in special_chars for c in password):
        return False, "Password must contain at least one special character (!@#$%...)."
    return True, ""

# From Search&Claim_item.py
items_list = [
    {
        "id": 1,
        "item_name": "Blue water bottle",
        "category": "Bottle",
        "description": "Stainless steel blue insulated flask with slight dent on base.",
        "location": "Central Library",
        "date": "2026-10-01",
        "contact": "Security Desk",
        "reported_by": "Campus Security Desk",
        "status": "Found",
        "claimed_by": None
    },
    {
        "id": 2,
        "item_name": "Black Wallet",
        "category": "Accessories",
        "description": "Leather tri-fold wallet with ID cards and metro pass.",
        "location": "C11 Ground Floor",
        "date": "2026-10-02",
        "contact": "Security Desk",
        "reported_by": "Guard Ramesh",
        "status": "Found",
        "claimed_by": None
    },
    {
        "id": 3,
        "item_name": "Calculator",
        "category": "Study",
        "description": "Casio fx-991EX scientific calculator with engraved initials on cover.",
        "location": "Canteen",
        "date": "2026-10-05",
        "contact": "Canteen Counter",
        "reported_by": "Canteen Staff",
        "status": "Found",
        "claimed_by": None
    },
    {
        "id": 4,
        "item_name": "Casio Digital Watch",
        "category": "Accessories",
        "description": "Silver metallic strap digital watch lost during lecture.",
        "location": "Auditorium Hall B",
        "date": "2026-10-14",
        "contact": "9811223344",
        "reported_by": "Priya Sen",
        "status": "Lost",
        "claimed_by": None
    },
    {
        "id": 5,
        "item_name": "HP Laptop Charger 65W",
        "category": "Tech",
        "description": "Blue-pin HP original laptop adapter left plugged in row 4.",
        "location": "Computer Lab 304",
        "date": "2026-10-18",
        "contact": "9876543210",
        "reported_by": "Rohan Mehta",
        "status": "Lost",
        "claimed_by": None
    },
    {
        "id": 6,
        "item_name": "Room Keys with Red Tag",
        "category": "Accessories",
        "description": "Set of two brass keys on a red campus lanyard.",
        "location": "Sports Complex",
        "date": "2026-10-22",
        "contact": "Gym Desk 1",
        "reported_by": "Coach Sharma",
        "status": "Found",
        "claimed_by": None
    }
]

# From Management.py (2D list)
records = [
    [
        "Item_ID", "Item_Name", "Category",
        "Description", "Status", "Location",
        "Date", "Reported_By", "Contact"
    ]
]
for item in items_list:
    records.append([
        str(item["id"]),
        item["item_name"],
        item["category"],
        item["description"],
        item["status"],
        item["location"],
        item["date"],
        item["reported_by"],
        item["contact"]
    ])


# ==============================================================================
# 2. HTTP REQUEST HANDLER
# ==============================================================================
class CampusRequestHandler(http.server.BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Admin-Password, X-Admin-User, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def send_json(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))

    def read_post_json(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > 0:
                raw_body = self.rfile.read(content_length).decode("utf-8")
                return json.loads(raw_body)
        except Exception as e:
            print("Error parsing JSON:", e)
        return {}

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # REST API Routes
        if path == "/api/items":
            self.send_json({"status": "success", "items": items_list})
            return

        elif path == "/api/records":
            self.send_json({"status": "success", "records": records})
            return

        elif path == "/api/users":
            query = parse_qs(parsed.query)
            admin_pw = (
                query.get("password", [None])[0]
                or query.get("admin_key", [None])[0]
                or self.headers.get("X-Admin-Password")
            )
            admin_user = (
                query.get("username", [None])[0]
                or self.headers.get("X-Admin-User")
            )

            # Protected User Management: Require compliant Pranav@230107 or pranav@230107
            if admin_pw not in ADMIN_SECRET_PASSWORDS and admin_pw != ADMIN_SECRET_PASSWORD:
                self.send_json({
                    "status": "error",
                    "code": 403,
                    "message": "Access Denied: Administrator authentication required to view user directory. Provide password 'Pranav@230107'."
                }, 403)
                return

            safe_users = {
                u: {k: v for k, v in info.items() if k != "password"}
                for u, info in users_db.items()
            }
            self.send_json({
                "status": "success",
                "authorized_user": admin_user or "admin",
                "total_users": len(safe_users),
                "users": safe_users
            })
            return

        elif path == "/api/health":
            self.send_json({"status": "online", "service": "Campus Lost & Found"})
            return

        # Static File Serving
        clean_path = path.lstrip("/")
        if not clean_path:
            clean_path = "index.html"

        file_path = os.path.join(BASE_DIR, clean_path)

        if os.path.exists(file_path) and os.path.isfile(file_path):
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                mime_type = "application/octet-stream"

            self.send_response(200)
            self.send_header("Content-Type", mime_type)
            self.send_cors_headers()
            self.end_headers()

            with open(file_path, "rb") as f:
                self.wfile.write(f.read())
        else:
            self.send_response(404)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"404 Not Found")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self.read_post_json()

        # 1. Report Item (Lost / Found)
        if path == "/api/items":
            next_id = max([i["id"] for i in items_list], default=0) + 1
            new_item = {
                "id": next_id,
                "item_name": body.get("item_name", "Untitled"),
                "category": body.get("category", "Other"),
                "description": body.get("description", ""),
                "location": body.get("location", "Campus"),
                "date": body.get("date", "2026-11-23"),
                "reported_by": body.get("reported_by", "Anonymous"),
                "contact": body.get("contact", "N/A"),
                "status": body.get("status", "Lost"),
                "claimed_by": None,
                "photo": body.get("photo", None)
            }
            items_list.insert(0, new_item)

            records.append([
                str(new_item["id"]),
                new_item["item_name"],
                new_item["category"],
                new_item["description"],
                new_item["status"],
                new_item["location"],
                new_item["date"],
                new_item["reported_by"],
                new_item["contact"]
            ])

            self.send_json({"status": "success", "item": new_item})
            return

        # 2. Claim Item
        elif path == "/api/claim":
            item_id = int(body.get("id", 0))
            claimant = body.get("claimant_name", "Pranav Deshwal")
            student_id = body.get("student_id", "S26CSEU1917")
            proof = body.get("proof", "Student ID card verification")

            target = next((i for i in items_list if i["id"] == item_id), None)
            if not target:
                self.send_json({"status": "error", "message": f"No item found with ID {item_id}"}, 404)
                return

            if target["status"] == "Claimed":
                self.send_json({"status": "error", "message": "Item has already been claimed"}, 400)
                return

            target["status"] = "Claimed"
            target["claimed_by"] = f"{claimant} ({student_id}) - Proof: {proof}"

            # Update row in records table
            for row in records[1:]:
                if row[0] == str(item_id):
                    row[4] = "Claimed"
                    break

            self.send_json({"status": "success", "item": target})
            return

        # 3. User Register
        elif path == "/api/register":
            username = body.get("username", "").strip().lower()
            password = body.get("password", "")
            role = body.get("role", "student")
            name = body.get("name", "Student")

            if not username or not password:
                self.send_json({"status": "error", "message": "Username and password required"}, 400)
                return

            if len(username) > MAX_USERNAME_LENGTH:
                self.send_json({"status": "error", "message": f"Username cannot exceed {MAX_USERNAME_LENGTH} characters."}, 400)
                return

            if len(username) < MIN_USERNAME_LENGTH:
                self.send_json({"status": "error", "message": f"Username must be at least {MIN_USERNAME_LENGTH} characters."}, 400)
                return

            is_valid_pw, pw_err = validate_password_policy(password)
            if not is_valid_pw:
                self.send_json({"status": "error", "message": f"Password policy error: {pw_err}"}, 400)
                return

            if username in users_db:
                self.send_json({"status": "error", "message": "Username already exists. Please choose another username."}, 400)
                return

            users_db[username] = {
                "password": password,
                "role": role,
                "name": name,
                "student_id": f"S26{os.urandom(2).hex().upper()}"
            }
            self.send_json({"status": "success", "username": username, "role": role, "name": name})
            return

        # 4. User Login
        elif path == "/api/login":
            username = body.get("username", "").strip().lower()
            password = body.get("password", "")

            if not username or not password:
                self.send_json({"status": "error", "message": "Username and password are required."}, 400)
                return

            if len(username) > MAX_USERNAME_LENGTH:
                self.send_json({"status": "error", "message": f"Username cannot exceed {MAX_USERNAME_LENGTH} characters."}, 400)
                return

            if len(username) < MIN_USERNAME_LENGTH:
                self.send_json({"status": "error", "message": f"Username must be at least {MIN_USERNAME_LENGTH} characters."}, 400)
                return

            is_valid_pw, pw_err = validate_password_policy(password)
            if not is_valid_pw:
                self.send_json({"status": "error", "message": f"Password policy violation: {pw_err}"}, 400)
                return

            user = users_db.get(username)
            is_match = user and (
                user["password"] == password or 
                (username == "pranav" and password in ("Pranav@230107", "pranav@230107"))
            )

            if is_match:
                self.send_json({
                    "status": "success",
                    "username": username,
                    "role": user["role"],
                    "name": user["name"],
                    "student_id": user.get("student_id", "")
                })
            else:
                self.send_json({"status": "error", "message": "Invalid username or password"}, 401)
            return

        # 5. Profile Update
        elif path == "/api/profile":
            username = body.get("username", "").strip().lower()
            new_name = body.get("new_name", "").strip()

            if username in users_db and new_name:
                users_db[username]["name"] = new_name
                self.send_json({"status": "success", "name": new_name})
            else:
                self.send_json({"status": "error", "message": "User not found or empty name"}, 400)
            return

        # 6. Admin Unlock & User Directory Auth Gateway
        elif path in ("/api/admin/verify", "/api/unlock-admin"):
            username = body.get("username", "").strip().lower()
            password = body.get("password", "")

            is_pw_valid = (password in ADMIN_SECRET_PASSWORDS or password == ADMIN_SECRET_PASSWORD)
            if is_pw_valid and (username in ("pranav", "admin")):
                safe_users = {
                    u: {k: v for k, v in info.items() if k != "password"}
                    for u, info in users_db.items()
                }
                self.send_json({
                    "status": "success",
                    "message": "Administrator authentication successful",
                    "admin_user": username,
                    "total_users": len(safe_users),
                    "users": safe_users
                })
            else:
                self.send_json({
                    "status": "error",
                    "code": 403,
                    "message": "Access Denied: Invalid administrator username or password."
                }, 403)
            return

        self.send_json({"status": "error", "message": "Endpoint not found"}, 404)


# ==============================================================================
# 3. RUN SERVER
# ==============================================================================
def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer((HOST, PORT), CampusRequestHandler) as httpd:
        print("\n" + "=" * 60)
        print("   CAMPUS LOST & FOUND — LIVE WEB APPLICATION")
        print("=" * 60)
        print(f"Server is running at: http://{HOST}:{PORT}")
        print(f"Directory: {BASE_DIR}")
        print("Press Ctrl+C to stop the server.")
        print("=" * 60 + "\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server. Goodbye!")


if __name__ == "__main__":
    run_server()
