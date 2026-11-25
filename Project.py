
users_db = {}

def register_user():
    print("\n--- Register ---")
    username = input("Enter a username: ")
    
    if username in users_db:
        print("Username already exists. Please try logging in.")
        return

    password = input("Enter a password: ")
    print("Roles: 1. Student | 2. Staff | 3. Administrator")
    role_choice = input("Select your role (1/2/3): ")

    
    if role_choice == '1':
        role = "student"
    elif role_choice == '2':
        role = "staff"
    elif role_choice == '3':
        role = "administrator"
    else:
        print("Invalid choice. Defaulting to student.")
        role = "student"

    name = input("Enter your full name: ")

    # Storing
    users_db[username] = {
        "password": password,
        "role": role,
        "name": name
    }
    print(f"\nRegistration successful! Welcome, {name}.")

def login_user():
    print("\n--- Login ---")
    username = input("Enter username: ")
    password = input("Enter password: ")

    # login validation
    if username in users_db and users_db[username]["password"] == password:
        role = users_db[username]["role"]
        print(f"\nLogin successful! Logged in as {role}.")
        return username, role
    else:
        print("\nInvalid username or password.")
        return None, None

def manage_profile(username):
    print("\n--- Manage Profile ---")
    print(f"Current Name: {users_db[username]['name']}")
    new_name = input("Enter new name (leave blank to keep current): ")

    if new_name.strip():
        users_db[username]['name'] = new_name
        print("Profile updated successfully.")
    else:
        print("No changes made.")

def user_management_menu():
    while True:
        print("\n=== User Management ===")
        print("1. Register")
        print("2. Login")
        print("3. Return to Main Menu")
        
        choice = input("Enter choice: ")

        if choice == '1':
            register_user()
        elif choice == '2':
            logged_in_user, role = login_user()
            if logged_in_user:
               manage their profile right after logging in
                manage_profile(logged_in_user)
        elif choice == '3':
            break
        else:
            print("Invalid choice. Please enter 1, 2, or 3.")

records = [[
    "Item_ID", "Item_Name", "Category",
    "Description", "Status", "Location",
    "Date", "Reported_By", "Contact"
]]

def management_module():
    # Function to report an item
    def report_item(status):

        item_id = input("Enter Item ID: ")
        name = input("Enter Item Name: ")
        category = input("Enter Category: ")
        description = input("Enter Description: ")
        location = input("Enter Location: ")
        date = input("Enter Date: ")
        person = input("Enter Your Name: ")
        contact = input("Enter Contact Number: ")

        records.append([
            item_id, name, category, description,
            status, location, date, person, contact
        ])

        print("Item saved successfully!")

    # Function to display all records
    def view_items():

        for row in records:
            print(row)

    # Function to search for an item
    def search_item():

        search = input("Enter item name to search: ").lower()
        found = False

        for row in records[1:]:
            if search in row[1].lower():

                print("Item Found!")
                print("Item ID:", row[0])
                print("Name:", row[1])
                print("Category:", row[2])
                print("Description:", row[3])
                print("Status:", row[4])
                print("Location:", row[5])

                found = True

        if not found:
            print("Item not found!")

    # Main menu
    while True:

        print("\n===== CAMPUS LOST & FOUND =====")
        print("1. Report Lost Item")
        print("2. Report Found Item")
        print("3. View All Items")
        print("4. Search Item")
        print("5. Exit")

        choice = input("Enter your choice: ")

        if choice == "1":
            report_item("Lost")

        elif choice == "2":
            report_item("Found")

        elif choice == "3":
            view_items()

        elif choice == "4":
            search_item()

        elif choice == "5":
            print("Thank you!")
            break

        else:
            print("Invalid choice!")

def search_and_claim_module():
    items_list = [
        {
            "id": 1,
            "item_name": "Blue water bottle",
            "category": "Bottle",
            "location": "Central Library",
            "date": "2026-10-01",
            "contact": "Security Desk",
            "status": "Found",
            "claimed_by": "None"
        },
        {
            "id": 2,
            "item_name": "Black Wallet",
            "category": "Accessories",
            "location": "C11 Ground Floor",
            "date": "2026-10-02",
            "contact": "Security Desk",
            "status": "Found",
            "claimed_by": "None"
        },
        {
            "id": 3,
            "item_name": "Calculator",
            "category": "Study",
            "location": "Canteen",
            "date": "2026-10-05",
            "contact": "Canteen Counter",
            "status": "Found",
            "claimed_by": "None"
        }
    ]

    def search_item():
        print("\n--- Search Items ---")
        query = input("Enter item name / keyword to search: ").strip().lower()

        if not query:
            print("Please enter a valid search term.")
            return

        matches = [
            item for item in items_list
            if query in item["item_name"].lower()
            or query in item["category"].lower()
            or query in item["location"].lower()
        ]

        if not matches:
            print("No matching items found")
        else:
            print(f"\nFound {len(matches)} matching item(s):")
            for item in matches:
                print(
                    f"ID: {item['id']} | Item: {item['item_name']} | "
                    f"Category: {item['category']} | Location: {item['location']} | "
                    f"Date: {item['date']} | Status: {item['status']} | Contact: {item['contact']}"
                )

    def claim_item():
        print("\n--- Claim Item ---")
        item_id_input = input("Enter ID of the item you want to claim: ").strip()

        if not item_id_input.isdigit():
            print("Invalid item ID. Please enter a number.")
            return

        target_id = int(item_id_input)
        selected_item = None
        for item in items_list:
            if item["id"] == target_id:
                selected_item = item
                break

        if not selected_item:
            print(f"No item found with ID {target_id}.")
            return

        if selected_item["status"] == "Claimed":
            print(f"Item ID {target_id} has already been claimed.")
            return

        print(f"\nClaiming: {selected_item['item_name']} ({selected_item['category']})")
        claimant_name = input("Enter your full name [Default: Aryan Vashistha]: ").strip()
        if not claimant_name:
            claimant_name = "Aryan Vashistha"

        student_id = input("Enter your student / enrollment ID [Default: S26CSEU1904]: ").strip()
        if not student_id:
            student_id = "S26CSEU1904"

        proof = input("Enter identifying details / proof of ownership: ").strip()
        if not proof:
            proof = "Student ID card verification"

        selected_item["status"] = "Claimed"
        selected_item["claimed_by"] = f"{claimant_name} ({student_id}) - Proof: {proof}"

        print(f"\nSuccess: Claim submitted for Item ID {target_id}!")
        print(f"Item Status updated to: {selected_item['status']}")

    def view_items():
        print("\n--- All Items ---")
        for item in items_list:
            print(
                f"ID: {item['id']} | Item: {item['item_name']} | "
                f"Category: {item['category']} | Location: {item['location']} | "
                f"Status: {item['status']}"
            )

    def main():
        while True:
            print("\n==============================")
            print("     SEARCH & CLAIM MODULE    ")
            print("==============================")
            print("1. Search Items")
            print("2. Claim Item")
            print("3. View Items")
            print("4. Exit")
            print("==============================")

            choice = input("Enter your choice (1-4): ").strip()

            if choice not in ["1", "2", "3", "4"]:
                print("Invalid choice. Please enter a number from 1 to 4")
                continue

            if choice == "1":
                search_item()
            elif choice == "2":
                claim_item()
            elif choice == "3":
                view_items()
            elif choice == "4":
                print("\nExiting Search & Claim module. Goodbye!")
                break

    main()


# ==========================================
# 4. FROM report_found_item.py
# ==========================================
def report_found_item():
    print("\n--- Report Found Item ---")

    #Reorting item found
    item_name = input("Enter item name: ")
    category = input("Enter category: ")
    location = input("Enter location found: ")

    #Status of report
    print("\nFound Item Reported Successfully!")
    print("Item:", item_name)
    print("Category:", category)
    print("Location:", location)

def report_lost_item():
    print("\n--- Report Lost Item ---")

    #Inputs for lost items
    reported_person=("Enter your name")
    reported_id=("Enter your id")
    item_name = input("Enter item name: ")
    category = input("Enter category: ")
    location = input("Enter location lost: ")
    description = input("Enter description: ")

    #Status of report
    print("\nLost Item Reported Successfully!")
    print("reported_person:", reported_person)
    print("reported_person_id:", reported_id)
    print("Item:", item_name)
    print("Category:", category)
    print("Location:", location)
    print("Description:", description)


while True:
    print("\n===================================")
    print("   CAMPUS LOST & FOUND PROJECT")
    print("===================================")
    print("1. User Management")
    print("2. Lost & Found Management")
    print("3. Search & Claim Module")
    print("4. Report Found Item")
    print("5. Report Lost Item")
    print("6. Exit")

    main_choice = input("Enter your choice (1-6): ")

    if main_choice == "1":
        user_management_menu()
    elif main_choice == "2":
        management_module()
    elif main_choice == "3":
        search_and_claim_module()
    elif main_choice == "4":
        report_found_item()
    elif main_choice == "5":
        report_lost_item()
    elif main_choice == "6":
        print("Exiting program.")
        break
    else:
        print("Invalid choice!")
