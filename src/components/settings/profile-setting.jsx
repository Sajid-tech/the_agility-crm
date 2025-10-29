import React from "react";
import { User, Mail, Phone, Calendar, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-context";

const ProfileSetting = ({

  passwordData,
  setPasswordData,
  handlePasswordChange,

  changePasswordMutation,

}) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 max-w-6xl mx-auto ">
      {/* Left Sidebar - Profile Info */}
      <div className="lg:col-span-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 shadow-sm">
     
        
        <div className="space-y-3">
         

          <div className="">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme Color</p>
            <div className="flex gap-2 flex-wrap">
              {["default", "yellow", "green", "purple", "teal", "gray"].map((color) => {
                const colorsMap = {
                  default: "bg-blue-600",
                  yellow: "bg-yellow-500",
                  green: "bg-green-600",
                  purple: "bg-purple-600",
                  teal: "bg-teal-600",
                  gray: "bg-gray-600",
                };
                const isActive = theme === color;
                return (
                  <button
                    key={color}
                    onClick={() => setTheme(color)}
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200
                      ${colorsMap[color]} 
                      ${isActive ? "shadow-md ring-1 ring-offset-1 ring-blue-400 scale-110" : "opacity-80 hover:opacity-100"}`}
                  >
                    {isActive && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Content - Forms */}
      <div className="lg:col-span-2 space-y-3">
     

        {/* Change Password Form */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4 shadow-sm">
          <div className="mb-2 pb-2 border-b border-gray-100 dark:border-gray-600">
            <h2 className="text-md font-medium text-gray-900 dark:text-white">Change Password</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Update your password securely</p>
          </div>
          
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="oldPassword" className="text-sm">Old Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({ ...prev, oldPassword: e.target.value }))
                  }
                  placeholder="Old password"
                  required
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPassword" className="text-sm">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  placeholder="New password"
                  required
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  placeholder="Confirm password"
                  required
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={changePasswordMutation.isLoading}
              className="h-9 text-sm px-4"
            >
              {changePasswordMutation.isLoading ? "Updating..." : "Change Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetting;