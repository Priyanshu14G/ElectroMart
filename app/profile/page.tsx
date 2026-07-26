'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Shield, Settings, LogOut } from 'lucide-react';
import { Header } from '@/components/layouts/header';
import { Footer } from '@/components/layouts/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@example.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, Karnataka',
    company: 'TechCore Electronics',
    bio: 'Electronics enthusiast and component supplier',
  });

  const handleLogout = () => {
    window.location.href = '/';
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-1 bg-card border border-border rounded-lg p-6"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl text-white mb-4">
                  {profile.name.charAt(0)}
                </div>
                <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
                <p className="text-muted-foreground text-sm mb-4">{profile.company}</p>
                <div className="w-full space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => setIsEditing(!isEditing)}>
                    <Settings className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                  <Button variant="outline" className="w-full text-red-600 hover:text-red-600" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>

              <div className="border-t border-border mt-6 pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Account Status
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email Verified</span>
                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs">✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Phone Verified</span>
                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs">✓</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Profile Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 bg-card border border-border rounded-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-6">Profile Information</h2>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </label>
                  <Input
                    value={profile.name}
                    disabled={!isEditing}
                    onChange={(e) => isEditing && setProfile({...profile, name: e.target.value})}
                    className="disabled:bg-muted"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                  <Input
                    value={profile.email}
                    disabled={!isEditing}
                    onChange={(e) => isEditing && setProfile({...profile, email: e.target.value})}
                    className="disabled:bg-muted"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </label>
                  <Input
                    value={profile.phone}
                    disabled={!isEditing}
                    onChange={(e) => isEditing && setProfile({...profile, phone: e.target.value})}
                    className="disabled:bg-muted"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </label>
                  <Input
                    value={profile.location}
                    disabled={!isEditing}
                    onChange={(e) => isEditing && setProfile({...profile, location: e.target.value})}
                    className="disabled:bg-muted"
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1">Save Changes</Button>
                    <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
