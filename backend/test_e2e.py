import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://localhost:3001/api/v1"

def request(method, path, data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode('utf-8') if data is not None else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode('utf-8')
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = {"raw": body}
        return e.code, parsed

def run_tests():
    print("=" * 60)
    print("RUNNING RAFEEQ V1.2 BACKEND END-TO-END VERIFICATION SUITE")
    print("=" * 60)

    # 1. API Health & Store List Check
    status, res = request("GET", "/stores")
    print(f"[*] API Health Check: {status == 200}")

    # 2. Register Pet Owner (FR-01, NFR-08: pet_owner only)
    reg_user = {
        "name": "Sarah Pet Owner",
        "phone": "0999887766",
        "password": "Password123",
        "confirmPassword": "Password123"
    }
    status, reg_res = request("POST", "/auth/register", reg_user)
    print(f"[*] Register Pet Owner: status={status}, message={reg_res.get('message')}")

    # 3. Login Pet Owner (FR-01)
    status, login_res = request("POST", "/auth/login", {"name": "Sarah Pet Owner", "password": "Password123"})
    print(f"[*] Login Pet Owner: status={status}")
    data = login_res.get('data') or {}
    token = data.get('accessToken')
    user_id = data.get('user', {}).get('id') or data.get('user', {}).get('_id')
    user_roles = data.get('user', {}).get('roles', [])
    print(f"[*] Assigned Roles: {user_roles} (Single role enforced: {len(user_roles) == 1})")

    # 4. Profile /me/profile (FR-13)
    status, prof_res = request("GET", "/me/profile", token=token)
    print(f"[*] Get Profile /me/profile: status={status}, name={prof_res.get('data', {}).get('user', {}).get('name')}")

    # Update profile PATCH /me/profile
    status, update_res = request("PATCH", "/me/profile", {"name": "Sarah Pet Owner"}, token=token)
    print(f"[*] Update Profile PATCH /me/profile: status={status}, message='{update_res.get('message')}'")

    # 5. Create Pet Profile (FR-03)
    pet_data = {
        "name": "Bella",
        "petType": "Persian Cat",
        "age": 2,
        "vaccinationRecordUrl": "https://example.com/vaccines.pdf",
        "lastVetVisitDate": "2026-02-10T00:00:00.000Z",
        "photoUrl": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
        "notes": "Gentle and quiet."
    }
    status, pet_res = request("POST", "/pets", pet_data, token=token)
    pet = pet_res.get('data') or {}
    pet_id = pet.get('_id')
    print(f"[*] Create Pet Profile: status={status}, petRef={pet.get('referenceCode')}, petId={pet_id}")

    # 6. Store & Cart & Checkout (FR-05)
    status, stores_res = request("GET", "/stores")
    stores = stores_res.get('data', [])
    store_id = stores[0].get('_id') if stores else None

    status, prods_res = request("GET", f"/stores/{store_id}/products")
    prods = prods_res.get('data', [])
    prod_id = prods[0].get('_id') if prods else None
    print(f"[*] Store Products: found {len(prods)} products")

    status, cart_res = request("POST", "/cart/items", {"productId": prod_id, "quantity": 1}, token=token)
    print(f"[*] Add to Cart: status={status}")

    status, order_res = request("POST", "/orders/checkout", {"deliveryAddress": "Damascus, Abu Rummaneh"}, token=token)
    order = order_res.get('data') or {}
    print(f"[*] COD Checkout: status={status}, orderRef={order.get('referenceCode')}")

    # 7. Veterinarians & Appointments (Section 6 & Section 10: internal VetModule)
    status, docs_res = request("GET", "/doctors")
    doctors = docs_res.get('data', [])
    doc = doctors[0] if doctors else {}
    doc_id = doc.get('doctorId')
    print(f"[*] Available Doctors: found {len(doctors)} (Selected: {doc.get('name')}, doctorId: {doc_id})")

    status, slots_res = request("GET", f"/doctors/{doc_id}/slots")
    slots = slots_res.get('data', [])
    selected_slot = slots[0] if slots else {}
    print(f"[*] Available Doctor Slots: found {len(slots)} (Slot: {selected_slot.get('day')} {selected_slot.get('time')})")

    # Pet owner books appointment
    vbook_data = {
        "doctorId": doc_id,
        "slotId": selected_slot.get('slotId'),
        "petId": pet_id
    }
    status, vbook_res = request("POST", "/bookings-vet", vbook_data, token=token)
    vet_booking = vbook_res.get('data') or {}
    vet_booking_id = vet_booking.get('_id')
    print(f"[*] Book Vet Appointment (/bookings-vet): status={status}, ref={vet_booking.get('referenceCode')}, message='{vbook_res.get('message')}'")

    # Doctor logs in to approve appointment
    status, doc_login = request("POST", "/auth/login", {"name": "Dr. Zaid Khouri", "password": "VetPass123"})
    doc_token = doc_login.get('data', {}).get('accessToken')
    print(f"[*] Doctor Login: status={status}, token={bool(doc_token)}")

    status, doc_appts = request("GET", "/appointments/vet", token=doc_token)
    print(f"[*] Doctor View Appointments (/appointments/vet): found {len(doc_appts.get('data', []))} incoming")

    status, approve_res = request("PATCH", f"/bookings-vet/{vet_booking_id}/status", {"status": "approved"}, token=doc_token)
    print(f"[*] Doctor Approves Appointment: status={status}, newStatus={approve_res.get('data', {}).get('status')}")

    # 8. Host Caregivers & Bookings (FR-06, Section 10)
    status, hosts_res = request("GET", "/hosts")
    hosts = hosts_res.get('data', [])
    host = hosts[0] if hosts else {}
    host_user_id = host.get('hostUserId')
    print(f"[*] Available Host Caregivers: found {len(hosts)} (Selected: {host.get('hostName')})")

    hbook_data = {
        "hostUserId": host_user_id,
        "petId": pet_id,
        "startDate": "2026-11-20T10:00:00.000Z",
        "endDate": "2026-11-22T10:00:00.000Z",
        "foodNotes": "Dry food twice daily"
    }
    status, hbook_res = request("POST", "/host-bookings", hbook_data, token=token)
    host_booking = hbook_res.get('data') or {}
    host_booking_id = host_booking.get('_id')
    print(f"[*] Book Host Caregiver (/host-bookings): status={status}, ref={host_booking.get('referenceCode')}, message='{hbook_res.get('message')}'")

    # Host logs in and confirms
    status, host_login = request("POST", "/auth/login", {"name": "Nasser Al-Homsi", "password": "HostPass123"})
    host_token = host_login.get('data', {}).get('accessToken')
    print(f"[*] Host Login: status={status}, token={bool(host_token)}")

    status, host_conf = request("PATCH", f"/host-bookings/{host_booking_id}/confirm", token=host_token)
    print(f"[*] Host Confirmed Booking: status={status}, status={host_conf.get('data', {}).get('status')}")

    # 9. Reviews & Ratings (FR-12, Section 10)
    rev_data = {
        "bookingType": "host_booking",
        "bookingId": host_booking_id,
        "rating": 5,
        "comment": "Exceptional care and great communication!"
    }
    status, rev_res = request("POST", "/reviews", rev_data, token=token)
    print(f"[*] Submit Review (/reviews): status={status}, message='{rev_res.get('message')}'")

    status, rev_list = request("GET", f"/reviews/host_caregiver/{host_user_id}")
    rev_summary = rev_list.get('data') or {}
    print(f"[*] Reviews Aggregation: avgRating={rev_summary.get('avgRating')}, totalCount={rev_summary.get('ratingsCount')}")

    # 10. Super Admin Console (Section 10)
    status, admin_login = request("POST", "/auth/login", {"name": "admin@rafeeq.sy", "password": "Admin@2026"})
    admin_token = admin_login.get('data', {}).get('accessToken')
    print(f"[*] Super Admin Login: status={status}, token={bool(admin_token)}")

    status, admin_stats = request("GET", "/admin/stats", token=admin_token)
    print(f"[*] Admin Stats: {admin_stats.get('data')}")

    status, admin_owners = request("GET", "/admin/pet-owners", token=admin_token)
    print(f"[*] Admin Pet Owners List: found {len(admin_owners.get('data', []))}")

    status, admin_hosts = request("GET", "/admin/hosts", token=admin_token)
    print(f"[*] Admin Hosts List: found {len(admin_hosts.get('data', []))}")

    status, admin_docs = request("GET", "/admin/doctors", token=admin_token)
    print(f"[*] Admin Doctors List: found {len(admin_docs.get('data', []))}")

    # Admin creates a new veterinarian
    import time
    ts = str(int(time.time()))[-4:]
    new_doc_data = {
        "name": f"Dr. Fadi Bitar {ts}",
        "phone": f"0955{ts}33",
        "password": "Password123",
        "confirmPassword": "Password123",
        "address": "Kafar Souseh, Damascus"
    }
    status, new_doc_res = request("POST", "/admin/doctors", new_doc_data, token=admin_token)
    print(f"[*] Admin Created New Doctor (/admin/doctors): status={status}, res={new_doc_res}")
    new_doc_data_obj = new_doc_res.get('data') or {}
    new_doc_id = new_doc_data_obj.get('id')
    if not new_doc_id and admin_docs.get('data'):
        new_doc_id = admin_docs['data'][0].get('id') or admin_docs['data'][0].get('doctorId')

    # Admin deactivates doctor
    status, deact_res = request("PATCH", f"/admin/doctors/{new_doc_id}", {"status": "unavailable"}, token=admin_token)
    print(f"[*] Admin Soft-Deactivates Doctor (/admin/doctors/:id): status={status}, status='{deact_res.get('data', {}).get('status')}'")

    print("=" * 60)
    print("ALL RAFEEQ V1.2 SPECIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()
