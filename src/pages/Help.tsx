import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, BookOpen, HeartPulse, Phone, ShieldAlert } from "lucide-react";

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
    <CardContent className="p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-pink-300" />
        </div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="text-white/70 space-y-2 leading-relaxed text-sm">{children}</div>
    </CardContent>
  </Card>
);

const Help = () => (
  <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden">
    <Navigation />
    <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float" />
    <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

    <main className="relative z-10 pt-24 pb-28 px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">Help &amp; safety</h1>
          <p className="text-white/60 mt-2">
            How TIA works, how to read your results, and when to speak to a professional.
          </p>
        </header>

        <Section icon={BookOpen} title="How TIA works">
          <p>
            You upload a thyroid lab report. TIA reads the values, compares them with common
            reference ranges, and explains what each marker means in plain language.
          </p>
          <p>
            Your check-ins, reminders and goals stay with your account, so TIA can show how things
            change over time and answer questions about your own results.
          </p>
        </Section>

        <Section icon={HeartPulse} title="Understanding your thyroid results">
          <p>
            <strong className="text-white/90">TSH</strong> is the signal your brain sends to the
            thyroid. High TSH often points to an underactive thyroid, low TSH to an overactive one.
          </p>
          <p>
            <strong className="text-white/90">T3 and T4</strong> are the hormones the thyroid makes.
            <strong className="text-white/90"> Free T3 and Free T4</strong> are the unbound,
            usable portions.
          </p>
          <p>
            <strong className="text-white/90">Anti-TPO</strong> is an antibody that can indicate an
            autoimmune thyroid condition.
          </p>
          <p>
            Reference ranges differ between laboratories, and a single value out of range does not
            by itself mean a diagnosis. Your doctor interprets results alongside your symptoms and
            history.
          </p>
        </Section>

        <Section icon={Phone} title="When to contact a healthcare professional">
          <ul className="list-disc pl-5 space-y-1">
            <li>Any result flagged as needing attention, or values far outside the range.</li>
            <li>New or worsening symptoms: heart racing, severe fatigue, unexplained weight change.</li>
            <li>Before starting, stopping or changing any medication or dose.</li>
            <li>If you are pregnant, planning a pregnancy, or breastfeeding.</li>
          </ul>
        </Section>

        <Section icon={ShieldAlert} title="Urgent and emergency situations">
          <p>
            TIA cannot help in an emergency. If you have chest pain, difficulty breathing, fainting,
            confusion, a very fast or irregular heartbeat, or you feel unsafe, contact your local
            emergency number or go to the nearest emergency department immediately.
          </p>
        </Section>

        <Section icon={AlertTriangle} title="Medical disclaimer">
          <p>
            TIA is an educational companion. It does not diagnose conditions, prescribe treatment or
            replace a doctor, and nothing it shows you should be used to make medical decisions on
            your own. Always follow the advice of a qualified healthcare professional.
          </p>
        </Section>
      </div>
    </main>
  </div>
);

export default Help;
