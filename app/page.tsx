'use client'

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

console.log("Button: ", Button)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="flex items-center justify-between px-6 py-4 shadow-sm bg-white">
            <div className="text-2xl font-bold text-primary">Feedback.ai</div>
            <Button asChild>
            <a href="/signup">Sign Up</a>
            </Button>
        </div>
      <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold max-w-3xl"
        >
            <div>Discharged? Great.</div>
            <div>Now continue your recovery -</div>
            <div>via text, video or audio.</div>            
        </motion.h1>
      </div>
      <div className="bg-primary-50 py-12 overflow-hidden">
        <h2 className="text-center text-xl font-semibold text-gray-700 mb-6">
          Over a hundred hospitals trust us
        </h2>
        <div className="overflow-hidden whitespace-nowrap">
          <motion.div
            className="flex space-x-12 px-4"
            animate={{ x: ["0%", "-100%"] }}
            transition={{
              repeat: Infinity,
              duration: 20,
              ease: "linear",
            }}
          >
            {[
              "CityCare Hospital",
              "Greenfield Medical",
              "Nova Health",
              "Wellbeing Clinic",
              "LifeBridge Hospital",
              "HopeLine",
              "Apollo Nexus",
              "Trinity Health",
              "CareFirst",
              "CityCare Hospital",
              "Greenfield Medical",
              "Nova Health",
              "Wellbeing Clinic",
              "LifeBridge Hospital",
              "HopeLine",
              "Apollo Nexus",
              "Trinity Health",
              "CareFirst",
            ].map((name, i) => (
              <div key={i} className="text-lg text-gray-600 font-medium">
                {name}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
