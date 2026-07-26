import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Stethoscope,
  Calendar,
  Clock,
  MapPin,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Skeleton } from "../../components/ui/skeleton";
import { doctorService, appointmentService } from "../../lib/api";
import type { Doctor } from "../../types";

const steps = ["Department", "Doctor", "Date & Time", "Confirm"];

const departments = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Urology",
];

export function BookAppointmentPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ["doctors", selectedDepartment],
    queryFn: () => doctorService.getAll({ department: selectedDepartment, limit: 50 }),
    enabled: currentStep === 1 && !!selectedDepartment,
  });

  const { data: timeSlots, isLoading: slotsLoading } = useQuery({
    queryKey: ["availability", selectedDoctor?.id, selectedDate],
    queryFn: () => appointmentService.getAvailability(selectedDoctor!.id, selectedDate),
    enabled: currentStep === 2 && !!selectedDoctor && !!selectedDate,
  });

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const handleSubmit = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTimeSlot) return;
    setIsSubmitting(true);
    try {
      await appointmentService.create({
        doctorId: selectedDoctor.id,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        reason,
      });
      toast.success("Appointment booked successfully!");
      navigate("/appointments");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to book appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!selectedDepartment;
      case 1: return !!selectedDoctor;
      case 2: return !!selectedDate && !!selectedTimeSlot;
      case 3: return true;
      default: return false;
    }
  };

  return (
    <DashboardLayout title="Book Appointment">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Appointment</h2>
            <p className="text-sm text-gray-500">Follow the steps to book your appointment</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    index < currentStep
                      ? "bg-blue-600 text-white"
                      : index === currentStep
                      ? "bg-blue-100 text-blue-600 ring-2 ring-blue-600"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                  }`}
                >
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium hidden sm:inline ${
                  index <= currentStep ? "text-gray-900 dark:text-white" : "text-gray-500"
                }`}>
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 ${
                  index < currentStep ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => {
                          setSelectedDepartment(dept);
                          setSelectedDoctor(null);
                        }}
                        className={`rounded-xl border p-4 text-left transition-all ${
                          selectedDepartment === dept
                            ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600 dark:bg-blue-900/30"
                            : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                        }`}
                      >
                        <p className="font-medium text-gray-900 dark:text-white">{dept}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Doctor</CardTitle>
                </CardHeader>
                <CardContent>
                  {doctorsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 rounded-xl border p-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-28" />
                          </div>
                          <Skeleton className="h-6 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : doctors?.data?.length === 0 ? (
                    <p className="py-8 text-center text-gray-500">No doctors available in this department</p>
                  ) : (
                    <div className="space-y-3">
                      {doctors?.data?.map((doctor: Doctor) => (
                        <button
                          key={doctor.id}
                          onClick={() => setSelectedDoctor(doctor)}
                          className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all ${
                            selectedDoctor?.id === doctor.id
                              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600 dark:bg-blue-900/30"
                              : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                          }`}
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <Stethoscope className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{doctor.specialization}</p>
                          </div>
                          <Badge variant="outline">ETB {doctor.consultationFee}</Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Date & Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="mb-3 block">Select Date</Label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {generateDates().map((date) => {
                        const dateStr = format(date, "yyyy-MM-dd");
                        const isSelected = selectedDate === dateStr;
                        return (
                          <button
                            key={dateStr}
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setSelectedTimeSlot("");
                            }}
                            className={`flex flex-col items-center rounded-xl border px-4 py-3 min-w-[80px] transition-all ${
                              isSelected
                                ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600 dark:bg-blue-900/30"
                                : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                            }`}
                          >
                            <span className="text-xs text-gray-500">{format(date, "EEE")}</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{format(date, "d")}</span>
                            <span className="text-xs text-gray-500">{format(date, "MMM")}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedDate && (
                    <div>
                      <Label className="mb-3 block">Select Time Slot</Label>
                      {slotsLoading ? (
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="h-10 w-24 rounded-lg" />
                          ))}
                        </div>
                      ) : timeSlots?.length === 0 ? (
                        <p className="text-gray-500">No available time slots for this date</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {timeSlots?.map((slot: string) => (
                            <button
                              key={slot}
                              onClick={() => setSelectedTimeSlot(slot)}
                              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                                selectedTimeSlot === slot
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-gray-200 hover:border-blue-300 dark:border-gray-700"
                              }`}
                            >
                              <Clock className="mr-1 inline h-3 w-3" />
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason for Visit (Optional)</Label>
                    <Textarea
                      id="reason"
                      placeholder="Describe your symptoms or reason for the visit..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Confirm Appointment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{selectedDoctor?.specialization}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        {selectedDate && format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        {selectedTimeSlot}
                      </div>
                    </div>
                    {reason && (
                      <div className="border-t pt-3">
                        <p className="text-sm text-gray-500">Reason: {reason}</p>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Consultation Fee</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          ETB {selectedDoctor?.consultationFee}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Booking
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
