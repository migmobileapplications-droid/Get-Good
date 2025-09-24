
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  User as UserIcon, 
  Award,
  Shield,
  Share2,
  Camera,
  Copy,
  Check,
  Bell,
  BellOff,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const getTotalXpForLevel = (level) => {
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += 100 * Math.pow(1.05, i - 1);
    }
    return Math.floor(total);
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({ full_name: "" });
  const [uploading, setUploading] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      setProfileData({ 
        full_name: userData.full_name || "",
        penalty_notifications: userData.penalty_notifications ?? true
      });
      
      // Generate invite code if user doesn't have one
      if (!userData.invite_code) {
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        await User.updateMyUserData({ invite_code: inviteCode });
        setUser(prev => ({ ...prev, invite_code: inviteCode }));
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await User.updateMyUserData(profileData);
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      await User.updateMyUserData({ profile_image: file_url });
      loadProfile();
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}?invite=${user.invite_code}`;
    await navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const currentLevelStartXP = user ? getTotalXpForLevel(user.level) : 0;
  const nextLevelStartXP = user ? getTotalXpForLevel(user.level + 1) : 100;
  const xpNeededForLevel = nextLevelStartXP - currentLevelStartXP;
  const xpProgressInLevel = user ? user.xp - currentLevelStartXP : 0;
  const xpProgressPercentage = xpNeededForLevel > 0 ? (xpProgressInLevel / xpNeededForLevel) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8 relative">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          My Profile
        </h1>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Your stats, progress, and settings</p>
        <Link to={createPageUrl("Settings")} className="md:hidden absolute top-0 right-0">
            <Button variant="ghost" size="icon">
                <Settings className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}/>
            </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 text-center`}
          >
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className={`w-full h-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full flex items-center justify-center overflow-hidden`}>
                {user.profile_image ? (
                  <img 
                    src={user.profile_image} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon className={`w-12 h-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white text-black rounded-full p-2 cursor-pointer hover:bg-gray-200 transition-colors">
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  placeholder="Full Name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                  className={`${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setProfileData(prev => ({ ...prev, penalty_notifications: !prev.penalty_notifications }))}
                    className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {profileData.penalty_notifications ? (
                      <Bell className="w-4 h-4" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                    Penalty notifications
                  </button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className={`flex-1 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>{user.full_name || "Get Good User"}</h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>{user.email}</p>
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>Edit Profile</Button>
              </div>
            )}
          </motion.div>

          {/* Invite Friends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6`}
          >
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
              <Share2 className="text-green-500" />
              Invite Friends
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Earn $5 in credits for each friend you invite! (Max $25/year)
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Your invite code:</span>
                <code className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'} px-2 py-1 rounded font-mono`}>{user.invite_code}</code>
              </div>
              
              <Button
                onClick={copyInviteLink}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                disabled={copiedInvite}
              >
                {copiedInvite ? (
                  <><Check className="w-4 h-4 mr-2" /> Copied!</>
                ) : (
                  <><Copy className="w-4 h-4 mr-2" /> Copy Invite Link</>
                )}
              </Button>
              
              <div className="text-xs text-gray-500 text-center">
                {user.invited_friends_count || 0}/5 friends invited this year
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6`}
          >
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
              <Award className={isDarkMode ? "text-purple-500" : "text-purple-600"}/>
              Level & Progression
            </h3>
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-black ${isDarkMode ? 'text-purple-400 bg-purple-900/30' : 'text-purple-600 bg-purple-100'} rounded-xl w-20 h-20 flex items-center justify-center`}>
                {user.level}
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Next Level: {xpProgressInLevel} / {xpNeededForLevel} XP</p>
                <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-4 mt-2 overflow-hidden`}>
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
            <div className={`mt-6 p-4 ${isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-100 border-green-300'} border rounded-xl flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <Shield className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}/>
                <div>
                  <p className={`font-bold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>Penalty Credits</p>
                  <p className={`text-xs ${isDarkMode ? 'text-green-500' : 'text-green-600'}`}>Use these to cover missed habits</p>
                </div>
              </div>
              <p className={`text-3xl font-black ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>${user.credits || 0}</p>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Gain $1 credit per level, and a $5 bonus every 5 levels!
            </p>
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6`}
          >
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`text-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl`}>
                <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.current_streak || 0}</div>
                <div className={`${isDarkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}`}>Current Streak</div>
              </div>
              <div className={`text-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl`}>
                <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.best_streak || 0}</div>
                <div className={`${isDarkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}`}>Best Streak</div>
              </div>
              <div className={`text-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl`}>
                <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.total_habits_completed || 0}</div>
                <div className={`${isDarkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}`}>Habits Completed</div>
              </div>
              <div className={`text-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl`}>
                <div className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.total_penalties || 0}</div>
                <div className={`${isDarkMode ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}`}>Total Penalties</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
