// Thyroid condition decision tree logic

export interface QuickReply {
  id: string;
  label: string;
  value: string;
}

export interface SymptomCheckbox {
  id: string;
  label: string;
}

export interface DecisionNode {
  message: string;
  quickReplies?: QuickReply[];
  symptomChecklist?: SymptomCheckbox[];
  condition?: string;
  isEducational?: boolean;
}

// Condition rules mapping
export const conditionRules = {
  low_tsh: {
    high_t4_or_t3: "Hyperthyroidism",
    normal_t4_t3: "Subclinical Hyperthyroidism",
    low_t4: "Central Hypothyroidism"
  },
  high_tsh: {
    low_t4: "Hypothyroidism",
    normal_t4: "Subclinical Hypothyroidism"
  }
};

// Educational disclaimer
export const EDUCATIONAL_DISCLAIMER = "\n\nThis information is educational and not a diagnosis. A doctor will interpret these results along with your symptoms and medical history.";

// Hyperthyroidism symptoms
export const hyperthyroidismSymptoms: SymptomCheckbox[] = [
  { id: "palpitations", label: "Palpitations (racing heart)" },
  { id: "weight_loss", label: "Unexplained weight loss" },
  { id: "heat_intolerance", label: "Heat intolerance" },
  { id: "anxiety", label: "Anxiety or nervousness" },
  { id: "tremors", label: "Tremors in hands" },
  { id: "sweating", label: "Excessive sweating" }
];

// Hypothyroidism symptoms
export const hypothyroidismSymptoms: SymptomCheckbox[] = [
  { id: "fatigue", label: "Fatigue or tiredness" },
  { id: "weight_gain", label: "Unexplained weight gain" },
  { id: "cold_intolerance", label: "Cold intolerance" },
  { id: "dry_skin", label: "Dry skin" },
  { id: "hair_loss", label: "Hair loss" },
  { id: "constipation", label: "Constipation" }
];

// Detect if message triggers decision tree
export function detectTrigger(message: string): "low_tsh" | "high_tsh" | null {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("tsh") && (lowerMessage.includes("low") || lowerMessage.includes("below"))) {
    return "low_tsh";
  }
  
  if (lowerMessage.includes("tsh") && (lowerMessage.includes("high") || lowerMessage.includes("above") || lowerMessage.includes("elevated"))) {
    return "high_tsh";
  }
  
  return null;
}

// Get initial response for TSH triggers
export function getInitialResponse(trigger: "low_tsh" | "high_tsh"): DecisionNode {
  if (trigger === "low_tsh") {
    return {
      message: "A low TSH can mean different things depending on other thyroid hormone levels.\n\nTo understand this better, could you tell me:\n\nIs your Free T4 high, normal, or low?",
      quickReplies: [
        { id: "high_t4", label: "Free T4 is high", value: "high" },
        { id: "normal_t4", label: "Free T4 is normal", value: "normal" },
        { id: "low_t4", label: "Free T4 is low", value: "low" },
        { id: "unknown_t4", label: "I don't have the report", value: "unknown" }
      ]
    };
  } else {
    return {
      message: "A high TSH usually means the thyroid may not be producing enough hormone.\n\nTo understand this better, could you tell me:\n\nIs your Free T4 low or normal?",
      quickReplies: [
        { id: "low_t4", label: "Free T4 is low", value: "low" },
        { id: "normal_t4", label: "Free T4 is normal", value: "normal" },
        { id: "unknown_t4", label: "I don't have the report", value: "unknown" }
      ]
    };
  }
}

// Get condition response based on TSH and T4 levels
export function getConditionResponse(tshLevel: "low_tsh" | "high_tsh", t4Level: string): DecisionNode {
  if (tshLevel === "low_tsh") {
    switch (t4Level) {
      case "high":
        return {
          message: `When TSH is low and thyroid hormones (T4 or T3) are high, this often points toward **hyperthyroidism**, where the thyroid is overactive.

**Why this happens:**
When your thyroid produces too much hormone, your pituitary gland responds by reducing TSH production (this is your body's feedback system).

**Common causes include:**
- Graves' disease (an autoimmune condition)
- Thyroid nodules
- Thyroiditis (inflammation of the thyroid)

Are you experiencing any of these symptoms?`,
          symptomChecklist: hyperthyroidismSymptoms,
          condition: "Hyperthyroidism",
          isEducational: true
        };
      
      case "normal":
        return {
          message: `This pattern is sometimes called **subclinical hyperthyroidism**.

**What this means:**
- Your thyroid hormone levels are still within normal range
- But your TSH is low, suggesting the thyroid may be slightly overactive

**Important to know:**
- This condition is often symptomless
- It typically requires monitoring over time
- Treatment is not always needed immediately
- Your doctor may recommend repeat testing in a few weeks${EDUCATIONAL_DISCLAIMER}`,
          condition: "Subclinical Hyperthyroidism",
          isEducational: true
        };
      
      case "low":
        return {
          message: `A low TSH with low T4 is uncommon and may indicate **central (secondary) hypothyroidism**.

**What this means:**
- This is a rare condition
- It may be related to how the pituitary gland is functioning
- The pituitary gland is not sending enough signals to the thyroid

**Next steps:**
This pattern usually requires specialist evaluation by an endocrinologist. Additional tests may be needed to understand the underlying cause.${EDUCATIONAL_DISCLAIMER}`,
          condition: "Central Hypothyroidism",
          isEducational: true
        };
      
      default:
        return {
          message: `I understand you don't have the complete report right now. 

To get a clearer picture of what your low TSH means, I'd recommend:
1. Getting a complete thyroid panel (TSH, Free T4, and T3)
2. Discussing the results with your doctor

Would you like me to explain what each of these tests measures?${EDUCATIONAL_DISCLAIMER}`,
          quickReplies: [
            { id: "explain_tests", label: "Yes, explain the tests", value: "explain" },
            { id: "other_question", label: "I have another question", value: "other" }
          ]
        };
    }
  } else {
    // high_tsh
    switch (t4Level) {
      case "low":
        return {
          message: `When TSH is high and T4 is low, this typically indicates **hypothyroidism** (underactive thyroid).

**Why this happens:**
When your thyroid doesn't produce enough hormone, your pituitary gland responds by increasing TSH to try to stimulate the thyroid.

**Common causes include:**
- Hashimoto's thyroiditis (an autoimmune condition, most common cause)
- Iodine deficiency
- Previous thyroid surgery or radioactive iodine treatment

Are you experiencing any of these symptoms?`,
          symptomChecklist: hypothyroidismSymptoms,
          condition: "Hypothyroidism",
          isEducational: true
        };
      
      case "normal":
        return {
          message: `This pattern is called **subclinical hypothyroidism**.

**What this means:**
- Your thyroid hormone levels are still in the normal range
- But your TSH is elevated, which may be an early sign

**Important to know:**
- Many people have no symptoms at this stage
- It's often monitored with repeat testing
- Not everyone with subclinical hypothyroidism needs treatment
- Your doctor will consider your TSH level, symptoms, and other factors${EDUCATIONAL_DISCLAIMER}`,
          condition: "Subclinical Hypothyroidism",
          isEducational: true
        };
      
      default:
        return {
          message: `I understand you don't have the complete report right now.

To get a clearer picture of what your high TSH means, I'd recommend:
1. Getting a complete thyroid panel (TSH, Free T4, and T3)
2. Discussing the results with your doctor

Would you like me to explain what each of these tests measures?${EDUCATIONAL_DISCLAIMER}`,
          quickReplies: [
            { id: "explain_tests", label: "Yes, explain the tests", value: "explain" },
            { id: "other_question", label: "I have another question", value: "other" }
          ]
        };
    }
  }
}

// Get symptom response
export function getSymptomResponse(condition: string, selectedSymptoms: string[]): string {
  const symptomCount = selectedSymptoms.length;
  
  if (symptomCount === 0) {
    return `It's actually quite common to not have noticeable symptoms, especially in earlier stages.

However, it's still important to:
- Follow up with your doctor
- Get regular monitoring
- Watch for any changes over time${EDUCATIONAL_DISCLAIMER}`;
  }
  
  if (symptomCount <= 2) {
    return `Thank you for sharing. Having ${symptomCount === 1 ? 'this symptom' : 'a few symptoms'} is helpful information for your doctor.

**What you can do:**
- Share these specific symptoms with your healthcare provider
- Keep a log of when symptoms occur and their severity
- This will help your doctor make informed decisions about treatment${EDUCATIONAL_DISCLAIMER}`;
  }
  
  return `Thank you for sharing. Having several of these symptoms, along with your thyroid levels, gives your doctor valuable information.

**Recommended next steps:**
- Schedule an appointment with your doctor or endocrinologist
- Bring your lab results and symptom list
- Ask about treatment options and what to expect

**Remember:** ${condition} is a very manageable condition. Many people live normal, healthy lives with proper treatment and monitoring.${EDUCATIONAL_DISCLAIMER}`;
}

// Explain thyroid tests
export function getTestExplanation(): string {
  return `Here's what each thyroid test measures:

**TSH (Thyroid Stimulating Hormone)**
- Produced by the pituitary gland
- Tells your thyroid to produce hormones
- Often the first test checked
- Normal range: typically 0.4 - 4.0 mIU/L

**Free T4 (Thyroxine)**
- The main hormone produced by the thyroid
- "Free" means the active, unbound portion
- Normal range: typically 0.8 - 1.8 ng/dL

**T3 (Triiodothyronine)**
- The more active thyroid hormone
- Most T3 is converted from T4 in the body
- Sometimes checked for specific conditions

**Why all three matter:**
Together, these tests give a complete picture of how your thyroid is functioning.${EDUCATIONAL_DISCLAIMER}`;
}
