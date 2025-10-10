import { ArrowLeft, Bell, Plus, Calendar, Pill, Stethoscope, TestTube } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Navigation from "@/components/Navigation";
import { useState } from "react";

const Reminders = () => {
  const navigate = useNavigate();
  const [medicationEnabled, setMedicationEnabled] = useState(true);
  const [labTestsEnabled, setLabTestsEnabled] = useState(false);
  const [doctorVisitsEnabled, setDoctorVisitsEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-deep-dark-purple relative overflow-hidden">
      <Navigation />
      
      {/* Floating Background Shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

      {/* Back Button */}
      <div className="relative z-10 pt-24 px-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/explore')}
          className="text-white hover:text-pink-300 transition-colors mb-8 focus:outline-none focus:ring-0"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
      </div>

      {/* Header Section */}
      <section className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-300 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Reminders & Alerts
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Never miss a medication dose or doctor's appointment with smart notifications.
          </p>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="relative z-10 px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-2 border-pink-400/50 hover:border-pink-400 transition-all duration-300 hover:shadow-[0_0_40px_hsl(330,80%,60%,0.5)]">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                    <Calendar className="w-6 h-6 text-pink-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Your Schedule</h3>
                </div>
                
                <Button 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full shadow-[0_0_20px_hsl(330,80%,50%,0.4)] hover:shadow-[0_0_30px_hsl(330,80%,50%,0.6)] transition-all duration-300"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Reminder
                </Button>
              </div>
              
              {/* Calendar Placeholder */}
              <div className="bg-white/5 rounded-xl border border-pink-400/30 p-6 min-h-64">
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-pink-300 mx-auto mb-4" />
                  <p className="text-white/70 text-lg">Your calendar will appear here</p>
                  <p className="text-white/50 text-sm mt-2">Add your first reminder to get started</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Reminder Types */}
      <section className="relative z-10 px-6 pb-20">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Medication Reminder */}
          <Card className={`bg-white/5 backdrop-blur-sm border-2 transition-all duration-300 ${
            medicationEnabled 
              ? 'border-pink-400 shadow-[0_0_30px_hsl(330,80%,60%,0.4)]' 
              : 'border-pink-400/30 hover:border-pink-400/50'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full transition-all duration-300 ${
                    medicationEnabled 
                      ? 'bg-gradient-to-br from-pink-500/30 to-purple-500/30' 
                      : 'bg-white/5'
                  }`}>
                    <Pill className={`w-6 h-6 ${medicationEnabled ? 'text-pink-300' : 'text-white/50'}`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Medication</h4>
                    <p className="text-white/60 text-sm">Daily thyroid medication reminders</p>
                  </div>
                </div>
                <Switch 
                  checked={medicationEnabled} 
                  onCheckedChange={setMedicationEnabled}
                />
              </div>
              
              {medicationEnabled && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/80 text-sm">📱 Next reminder: Tomorrow at 8:00 AM</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lab Tests Reminder */}
          <Card className={`bg-white/5 backdrop-blur-sm border-2 transition-all duration-300 ${
            labTestsEnabled 
              ? 'border-pink-400 shadow-[0_0_30px_hsl(330,80%,60%,0.4)]' 
              : 'border-pink-400/30 hover:border-pink-400/50'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full transition-all duration-300 ${
                    labTestsEnabled 
                      ? 'bg-gradient-to-br from-pink-500/30 to-purple-500/30' 
                      : 'bg-white/5'
                  }`}>
                    <TestTube className={`w-6 h-6 ${labTestsEnabled ? 'text-pink-300' : 'text-white/50'}`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Lab Tests</h4>
                    <p className="text-white/60 text-sm">Periodic blood work reminders</p>
                  </div>
                </div>
                <Switch 
                  checked={labTestsEnabled} 
                  onCheckedChange={setLabTestsEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Doctor Visits Reminder */}
          <Card className={`bg-white/5 backdrop-blur-sm border-2 transition-all duration-300 ${
            doctorVisitsEnabled 
              ? 'border-pink-400 shadow-[0_0_30px_hsl(330,80%,60%,0.4)]' 
              : 'border-pink-400/30 hover:border-pink-400/50'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full transition-all duration-300 ${
                    doctorVisitsEnabled 
                      ? 'bg-gradient-to-br from-pink-500/30 to-purple-500/30' 
                      : 'bg-white/5'
                  }`}>
                    <Stethoscope className={`w-6 h-6 ${doctorVisitsEnabled ? 'text-pink-300' : 'text-white/50'}`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Doctor Visits</h4>
                    <p className="text-white/60 text-sm">Appointment reminders</p>
                  </div>
                </div>
                <Switch 
                  checked={doctorVisitsEnabled} 
                  onCheckedChange={setDoctorVisitsEnabled}
                />
              </div>
              
              {doctorVisitsEnabled && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white/80 text-sm">📅 Next appointment: Dec 15 at 2:00 PM</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Reminders;
