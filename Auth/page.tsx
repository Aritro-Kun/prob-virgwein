'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail } from "lucide-react";

export default function Home() {
  const [pname, setPName] = useState('');
  const [pid, setPId] = useState('');
  const [pmail, setPMail] = useState('');
  const [ppassword, setPPassword] = useState('');
  const [showPPassword, setShowPPassword] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div
      initial = {{ opacity:0, y:-20 }}
      animate = {{ opacity:1, y:0 }}
      transition={{duration:0.5}}
      className = "w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className = "text-3xl font-bold tracking-tighter">Welcome</h1>
            <p className = "text-muted-foreground">Sign-up to start getting access</p>
          </div>
          <form className = "space-y-10">
            <div className = "space-y-2">
              <Label htmlFor="patientname">Patient Name</Label>
              <Input
              id = "patientName"
              type = "text"
              placeholder = "McIntosh"
              value={pname}
              onChange = {(e) => setPName(e.target.value)}
              required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientid">Patient Id</Label>
              <Input
              id = "patientId"
              type = "text"
              placeholder = "P1234"
              value = {pid}
              onChange = {(e) => setPId(e.target.value)}
              required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientmail">Mail</Label>
              <Input
              id = "patientMail"
              type = "email"
              placeholder = "leroye@somewhere.com"
              value = {pmail}
              onChange = {(e) => setPMail(e.target.value)}
              required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientpassword">Password</Label>
              <div className="relative">
                <Input 
                id = "patientspassword"
                type = {showPPassword?"text":"password"}
                value = {ppassword}
                onChange={(e) => setPPassword(e.target.value)}
                required
                />
                <button 
                type="button"
                onClick = {() => setShowPPassword(!showPPassword)}
                className = "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className = "flex items-center space-x-2">
                <Checkbox id="remember me"/>
                <Label htmlFor="remember">Remember me</Label>
              </div>
              <a href="#" className="text-sm text-primary-500 hover:text-primary-600">Have an account? Login</a>
            </div>
            <Button type="submit" className="w-full">
              Sign up
            </Button>
          </form>
          <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"/>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className = "bg-white px-2 text-muted-foreground">Or continue as</span>
              </div>
          </div>
          <div className="text-center text-sm">
            Hospital Admin?{" "}
            <a href="#" className = "text-primary-500 hover:text-primary-600 font-medium">Log in</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
