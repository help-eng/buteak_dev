# Escalation System – Problems & Suggested Improvements

This document contains:

* Task classification framework
* Identified problems in the current system with solutions
* Future enhancements for later phases

---

## 🎯 Task Classification Framework

### ⭐ What Are We Classifying?

We classify tasks based on:

* **Urgency** (how soon)
* **Effort** (how much work)
* **Impact** (on guest experience)
* **Time required** (best measurable metric)
* **Department** (housekeeping / room service / maintenance / receptionist)

### 🏨 Industry Standard Approach

Hotels typically use four to five severity buckets:

1. Immediate (0–5 min)
2. Quick Response (5–15 min)
3. Routine (15–60 min)
4. Delayed/Maintenance (1–4 hours)
5. Major Work (4 hours–1 day)

This aligns with facilities management and CMMS systems used globally.

---

## 🌟 Proposed Category Set (Simple + Scalable)

### **Category T1 — Immediate Response (0–15 min)**

**Examples:**
* Send bill/invoice
* Give wifi password
* Bring water bottles
* Give extra towel
* Connect call to housekeeping
* Guest needs directions
* Minor desk tasks
* Bring toiletries
* Restock minibar
* Deliver room service items (not cooked)
* Provide blankets, pillows
* Extra hangers, tissue boxes
* Remote control replacement
* Room key card issue
* Send someone to check a simple issue

**Description:** Instant or very quick tasks requiring minimal effort. Can be handled by any available staff member immediately.

---

### **Category T2 — Standard Tasks & Simple Technical (15 min–3 hours)**

**Examples:**
* Deliver cooked food
* Room cleaning (light to moderate)
* Laundry pickup/drop
* Basic housekeeping assistance
* Deep cleaning
* Preparing special food orders
* Room turnover
* Ironing clothes
* Preparing breakfast trays
* Setting up extra beds
* Bathroom deep cleaning
* TV not working (settings/remote issue)
* Wi-Fi connectivity problems
* Light bulb replacement
* Thermostat adjustment issues
* Bathroom minor fixtures (loose tap, shower head)
* Door lock not working smoothly
* Curtain/blind mechanism stuck
* Safe not opening (user error)
* Phone line issues

**Description:** Standard operational tasks and simple technical issues. Includes cooking, cleaning, preparation work, and basic maintenance that can be diagnosed and fixed with tools on hand.

---

### **Category T3 — Complex Technical Issues (3–8 hours)**

**Examples:**
* AC not cooling (gas refill, compressor issue)
* Hot water system failure (geyser repair)
* Electrical board malfunction
* Deep plumbing work (pipe replacement)
* Major appliance breakdown (fridge, washing machine)
* Structural issues (ceiling leak, wall damage)
* Elevator malfunction
* Generator problems
* CCTV or security system issues

**Description:** Complex technical work requiring specialized skills, external parts, or contractor involvement. May need multiple visits or vendor coordination.

---

### **Category T4 — Critical (Emergency) (Immediate, but long)**

**Examples:**
* Active water leakage
* Electrical hazard (sparking, burning smell)
* Guest medical emergency
* Fire alarm
* Gas leakage
* Complete power failure in room
* Sewage backup
* Broken glass with injury risk
* Pest infestation (rats, snakes)

**Description:** Needs instant response regardless of time. Affects guest safety or causes severe discomfort. Immediate broadcast to all levels.

---

---

## 📊 Task Category Reference Table

| Category | Name | Time | Example |
|----------|------|------|---------|
| T1 | Immediate Response | 0–15 min | Bring towel, invoice, water, toiletries, blankets |
| T2 | Standard Service | 15–60 min | Food delivery, room cleaning, laundry, room turnover |
| T3 | Technical Issues | 1–12 hrs | TV, Wi-Fi, AC, plumbing, electrical, appliances |
| T4 | Critical (Emergency) | Immediate | Leakage, fire, electrical hazard, medical emergency |

---

---

## 🧠 Why This Categorization Works

✔ **Covers all hotel operations**  
Housekeeping, food, reception, technical, emergency.

✔ **Allows ChatGPT classification**  
Very easy examples:
* "Bring towel" → T1
* "Deliver lunch" → T2
* "TV not working" → T3
* "AC not cooling" → T3
* "The bathroom is leaking" → T4

✔ **Easy to maintain (only 4 categories)**

✔ **Perfect for SLA logic**
* T1: L1 gets 5 min, L2 after 10 min, L3 after 15 min
* T2: L1 gets 20 min, L2 after 40 min, L3 after 60 min
* T3: L1 gets 2 hrs, L2 after 6 hrs, L3 after 12 hrs
* T4: Instant broadcast to all L-levels

✔ **Works globally** — not hotel specific

---

## 🧩 Problems & Solutions

### **Problem 1 — Multiple Pending Tasks Ambiguity**

#### **❌ THE PROBLEM (Current Setup)**

When a Manager (or any Lx staff) clicks **Acknowledge**, your Make.com scenario does this:

**Step 1**  
Make gets the mobile number → finds Staff record → gets Staff ID.

**Step 2**  
Make searches the Zoho Service_Requests module:

```
Find tasks where Staff = this Staff ID AND Status = Pending
```

**Step 3**  
Make updates the found record(s) → Status = In Progress

#### **❗ CRITICAL ISSUE**

What if Manager has:
* Task A → Pending
* Task B → Pending
* Task C → Pending

All escalated to her.

Now she clicks **Acknowledge** for Task A.

**Make.com WILL NOT KNOW WHICH TASK SHE MEANT.**

It will see 3 Pending tasks assigned to her, and then:
* Depending on your search config, either all 3 will switch to In Progress
* Or Make will pick the first one in the list
* Or Zoho will return random order (Zoho API doesn't guarantee ordering)

**Meaning → Acknowledge becomes COMPLETELY UNRELIABLE.**

---

#### **🔥 WHAT CAN HAPPEN IN REAL LIFE?**

**Scenario 1**  
Acknowledge one → all escalated tasks close unexpectedly → **MAJOR OPERATIONAL FAILURE**.

**Scenario 2**  
Wrong task gets marked as In Progress → Other tasks keep escalating → Manager gets spammed again → System chaos.

**Scenario 3**  
If two escalated tasks arrive back-to-back → staff cannot tell which Acknowledge applies to which.

---

#### **⭐ ROOT CAUSE**

The system does NOT tie:
* The WhatsApp button click to
* The specific ticket ID

So Make.com is forced to guess based on Staff ID — and that will never scale.

---

#### **⭐ HOW TO FIX THIS (THE RIGHT WAY)**

**💡 Solution: Add `recordId` INTO the WhatsApp button payload**

Every WA button should include the ticket's unique ID.

**Example template button:**

```
Button 1: Acknowledge
Payload: ACK_{{recordId}}
```

**Example actual payload delivered to webhook:**

```
ACK_926382000001538005
```

Then Make.com simply reads:
1. Read the button payload
2. Extract record ID
3. Update only that exact ticket

---

#### **⭐ FIXED MAKE.COM LOGIC**

When receiving WA message:

```ts
// 1. Extract payload
const payload = message.button.payload; // e.g. "ACK_926382000001538005"

// 2. Split string and get recordId
const [action, recordId] = payload.split('_');

// 3. Update that exact ticket only
if (action === "ACK") {
  await zoho.updateRecord("Service_Requests", recordId, {
    Status: "In Progress",
    Staff: staffId
  });
}

if (action === "COMP") {
  await zoho.updateRecord("Service_Requests", recordId, {
    Status: "Completed"
  });
}
```

This 100% fixes ambiguity.

---

#### **⭐ REQUIRED WATI TEMPLATE CHANGE**

Modify your escalation template to add button with payload:

```json
{
  "buttons": [
    {
      "type": "QUICK_REPLY",
      "text": "Acknowledge",
      "payload": "ACK_{{recordId}}"
    },
    {
      "type": "QUICK_REPLY",
      "text": "Completed",
      "payload": "COMP_{{recordId}}"
    }
  ]
}
```

---

#### **⭐ BACKEND MUST INSERT `recordId` INTO THE TEMPLATE PARAMETERS**

When sending template:

```ts
await wati.sendTemplateMessage(
  staff.Mobile,
  "escalation_template",
  {
    recordId: request.id,
    guestName: request.Guest_Name,
    roomNumber: request.Room_Number,
    taskDescription: request.Description
  }
);
```

Or if WATI requires explicit payload mapping:

```ts
await wati.sendTemplateMessage(
  staff.Mobile,
  "escalation_template",
  {
    buttons: [
      { 
        type: "QUICK_REPLY", 
        text: "Acknowledge", 
        payload: `ACK_${recordId}` 
      },
      { 
        type: "QUICK_REPLY", 
        text: "Completed", 
        payload: `COMP_${recordId}` 
      }
    ]
  }
);
```

---

#### **⭐ RESULT: PERFECT BEHAVIOR**

Manager has 3 pending tasks:
* A (ID: 926382000001538001)
* B (ID: 926382000001538005)
* C (ID: 926382000001538009)

Backend sends 3 WA messages:
* To A → payload = `ACK_926382000001538001`
* To B → payload = `ACK_926382000001538005`
* To C → payload = `ACK_926382000001538009`

Manager clicks **Acknowledge** on B.

The payload is:
```
ACK_926382000001538005
```

Make updates **ONLY ticket B** → Status = In Progress.

**Problem solved. System is now deterministic.**

---

### **Problem 2 — Escalation Exceptions**

Several scenarios require special handling where standard escalation should not apply or needs modification.

---

#### **2.1 — Guest Requests Something the Hotel Does NOT Have**

**Examples:**
* "Send me bouquet and gift wrapping paper"
* "I need a razor blade"
* "Bring mouthwash"
* "Get me a charger for Samsung S22"
* "Can you get me a Bluetooth speaker?"

This is extremely common.

**❗ Problems caused:**
* Staff don't know what to respond
* They cannot click Completed
* Escalation will keep firing because task is Pending/In Progress
* Manager/Owner gets spammed unnecessarily
* Hotel feels unprofessional

**⭐ Solution — Introduce a new ticket state: "Needs Approval"**

This is standard in hotels and maintenance workflows.

When staff receives such a ticket, they click:

🟡 **"Needs Approval"**

Backend → `Status = "Needs Approval"`

Then system sends WhatsApp to **L1 (Reception) + Manager (simultaneously)**:

```
Guest requested an item that requires approval:
Item: Bouquet & gift wrapping paper
Reason: Not available in hotel inventory
Please approve or reject.
```

Two new buttons for managers:
* **Approve**
* **Reject**

**If Manager Clicks Approve:**

Backend:
```ts
Status = "Pending Procurement"
Assign staff (procurement person)
SLA = separate (30–60 min or custom)
```

Guest gets message:
```
Your request has been approved. We are arranging it.
```

**If Manager Clicks Reject:**

Backend:
```ts
Status = "Rejected"
```

Guest gets message:
```
I'm sorry, we are unable to provide this item due to availability/policy.
```

---

#### **2.2 — Guest Requests Something AGAINST Policy**

**Examples:**
* "Send me cigarettes"
* "Alcohol to the room without license"
* "Hookah"
* "Send me a lighter"
* "Massage services" (often against policy)

**❗ Problems:**
* Staff gets confused
* Risk of reputation/legal issue
* Escalation unnecessary here too

**⭐ Solution — Automatic Policy Detection**

ChatGPT classifies request → **Policy Restricted**.

Backend marks ticket:
```ts
Status = "Restricted Request (Approval Needed)"
Category = "T0" (No SLA)
```

Send message to Manager:
```
Guest requested a restricted item:
Item: Cigarettes
Policy: Smoking inside hotel is not allowed
Approve exception or reject
```

Manager gets two buttons:
* **Allow Exception**
* **Reject**

**If rejected** → Guest message:
```
We're sorry, but this request cannot be processed as per hotel policy.
```

**If approved** → Continue like a normal T1/T2 with extended SLA.

---

#### **2.3 — ChatGPT Assigns a Category but REALITY Requires More Time**

**Example:**
```
"Cook me clam chowder"
→ ChatGPT: T2 = 15–60 mins
But kitchen is overloaded → It will take 1 hour 30 minutes.
```

This is unavoidable in real operations.

**⭐ Solution — Let staff override SLA with a button**

When staff receives the task, add a 3rd button:
* In Progress
* Completed
* ⏳ **Request More Time**

When **"Request More Time"** is clicked:

Backend → `Status = "Delayed"`

Backend → Ask staff: "How much more time?" (quick reply buttons)

Example quick replies:
* +15 min
* +30 min
* +1 hour

Staff chooses one → SLA reset.

Guest also gets auto notification:
```
Your order is being prepared but may take additional time due to high volume.
Revised timeline: 45 minutes.
```

This keeps the guest informed and prevents complaints.

---

#### **2.4 — Staff is Busy and Cannot Take the Task**

**Example:**
* Staff is already cleaning 3 rooms
* Kitchen has many orders
* Maintenance is working on multiple tickets

**❗ Problems:**
* SLA breaks
* Escalation triggers incorrectly
* Staff stress increases

**⭐ Solution — Auto-reroute task to next available staff**

You already have Make.com logic to select staff with least tickets, but here's the improvement:

After staff clicks:

❌ **"Cannot Take Task"**

Backend:
```ts
Staff = NULL
Status = "Unassigned"
// Rerun staff selection logic
// Assign new staff
```

Notify guest:
```
Your request is reassigned to a new staff member.
```

---

#### **2.5 — Guest Keeps Asking Unrealistic or Long Tasks**

**Example:**
* "I want you to deep clean my entire kitchen"
* "I want my room repainted"
* "I want decoration in 2 hours"

These need a different workflow.

**⭐ Solution — ChatGPT flags requests as 'Project Tasks'**

Category = **TP (Task Project)**

Flow:
* No SLA
* Assigned to Manager directly
* Manager decides manpower/time

Guest receives transparency message:
```
This request requires longer preparation time. 
The staff will get back to you with a schedule shortly.
```

---

### **Problem 3 — Escalation Staff Cannot Complete Tickets**

Currently, escalation staff (L1/L2/Lx) only receive an **Acknowledged** button. Once they acknowledge:

* Status changes from **Pending → In Progress**
* Staff field updates to the escalated staff (good)

**BUT:** they cannot mark the ticket as **Completed**, because that button exists only in the *original staff* template.

**Result:**

* Ticket gets stuck in **In Progress** forever
* Guest never gets completion notification or feedback flow
* Backend cannot auto-close properly
* Escalation becomes meaningless if new handler cannot finish the ticket

---

#### **Solution — Unified Template with Two Buttons for All Levels**

Send the **same template** to original staff AND all escalation levels.

The template contains **two buttons**:

1. **In Progress / Acknowledge**
2. **Completed**

This eliminates template fragmentation and gives full control to anyone handling the ticket.

**Why this solves the problem:**

* Escalation staff can take ownership AND complete the request
* No special escalation-only templates required
* No stuck "In Progress" tickets
* Guest feedback flow becomes consistent
* All levels follow the same interface
* Makes WATI template management much simpler and cheaper

---

#### **Revised Flow with This Solution**

**1. Ticket Created → Pending**

Backend sends the unified template to L0 (original staff).

**2. If escalated**

Backend sends **the same template** to L1/L2/Lx, not a reduced one.

**3. When staff clicks "In Progress / Acknowledge"**

Backend:

```ts
Status = "In Progress";
Staff = clickedStaffId; // new owner
```

Stops escalation.

**4. When staff clicks "Completed"**

Backend / Make.com:

```ts
Status = "Completed";
Completion_Time = Date.now();
```

Guest receives thank-you + feedback message.

---

#### **Technical Implementation Summary**

**Backend now always sends this template to ANY staff level:**

```
Buttons:
- In Progress / Acknowledge
- Completed
```

**Backend logic changes:**

```ts
if (button == "In Progress") {
  await updateRecord({ Status: "In Progress", Staff: staffId });
  stopEscalation();
}

if (button == "Completed") {
  await updateRecord({ Status: "Completed" });
  notifyGuestFeedback();
}
```

**Escalation logic remains the same except:**

Every time escalation fires, backend sends the full template (not a restricted one).

---

#### **End Result (Clean State Machine)**

```
Pending → In Progress → Completed
```

Any level (L0, L1, L2, L3…) can perform all actions.

This is aligned with standard ticketing systems and ensures seamless operational flow.

---

## ⏳ Future Improvements

### **1. Dynamic Escalation Profiles**

Different departments/tasks require different escalation timings. Instead of a single X-minute wait, define an SLA matrix.

#### **Example Config (escalation.ts):**

```ts
export const ESCALATION_MATRIX = {
  "T1": { L1: 300000, L2: 600000, L3: 900000 }, // 5, 10, 15 min
  "T2": { L1: 1200000, L2: 2400000, L3: 3600000 }, // 20, 40, 60 min
  "T3": { L1: 7200000, L2: 21600000, L3: 43200000 }, // 2, 6, 12 hrs
  "T4": { L1: 0, L2: 0, L3: 0 }, // Immediate broadcast
};
```

#### **Backend Usage:**

```ts
const taskCategory = request.Category || "T2";
const timingConfig = ESCALATION_MATRIX[taskCategory] || DEFAULT_TIMING;
const waitTime = timingConfig[currentLevel];
```

This allows hotels to define proper SLA per task category.

---

### **2. Multi-staff Acknowledgment (First-click-wins)**

Multiple staff at the same level may receive the message. The first person to click **Acknowledged** becomes the handler.

#### **Make.com Logic:**

* Watch incoming WA message
* When someone presses **Acknowledged**:
  * Find ticket by ID
  * Update:
    * `Staff = clickedStaffId`
    * `Status = "Acknowledged"`
* Backend stops further escalation

#### **Backend Safeguard:**

```ts
if (request.Status === "Acknowledged" || request.Status === "Completed") {
  console.log("Already handled → stop escalation.");
  return;
}
```

#### **Notify Other Staff:**

Send a template:

```
This request has already been acknowledged by {{Name}}.
```

---

### **3. Auto-close / Auto-reminder for Acknowledged Tickets**

If staff acknowledge but forget to complete the task, the system should monitor idle tickets.

#### **Backend Scheduled Monitor:**

You can create a CRON job:

```ts
const idleTickets = await zohoCRM.search("Service_Requests", `(Status:equals:Acknowledged)`);
idleTickets.forEach(ticket => {
  const elapsed = Date.now() - new Date(ticket.Acknowledged_Time).getTime();
  if (elapsed > 30 * 60 * 1000) {
    sendReminder(ticket);
  }
});
```

#### **Auto-close:**

```ts
if (elapsed > 24 * 60 * 60 * 1000) {
  zohoCRM.updateRecord("Service_Requests", id, {
    Status: "Timed Out (System)",
  });
}
```

---

### **4. Smart Retry & Failure Handling**

When Zoho/WATI fails, escalation should not stop.

#### **Retry Helper:**

```ts
async function retry(fn, retries = 3, delay = 2000) {
  try { return await fn(); }
  catch (err) {
    if (retries <= 0) throw err;
    console.log(`Retrying in ${delay} ms...`);
    await new Promise(r => setTimeout(r, delay));
    return retry(fn, retries - 1, delay * 2); // exponential
  }
}
```

#### **Usage:**

```ts
await retry(() => wati.sendTemplateMessage(...));
```

This ensures messages aren't lost due to temporary network issues.

---

### **5. Smart Staff Selection**

Make.com can fetch staff based on:

* Who has fewer open tickets
* Who is available
* Who is on shift

#### **Zoho Search Example:**

```ts
(Assigned_Tickets:less_than:5)
```

Then Make.com assigns the task to the least-loaded staff.

This ensures hotel workload balance.

---

### **6. Button-Based Escalation Pause**

Since WATI has an **Acknowledged** button, you do **not** need NLP-based stop words.

#### **Backend:**

```ts
if (request.Status === "Acknowledged") {
  console.log("Escalation paused by user.");
  return;
}
```

This cleanly pauses escalation without needing staff message interpretation.

---

### **7. SLA Countdown Messages**

Requires separate WA templates → cost → postpone.

---

### **8. Proof of Work (Photos)**

WATI webhook likely doesn't support media → postpone.

---

### **9. Level-specific Templates**

Each level needs separate approved template → postpone.

---

### **10. Escalation Dashboard**

Supervisor-friendly dashboard → future enhancement.

---