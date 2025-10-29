import React, { useState } from "react";
import {  useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";


import BASE_URL from "@/config/base-url";
import Cookies from "js-cookie";

import ProfileSetting from "@/components/settings/profile-setting";

const Settings = () => {


  const token = Cookies.get("token");





  

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  

 
 





  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData) => {
      const response = await axios.post(
        `${BASE_URL}/api/panel-change-password`,
        {
          old_password: passwordData.oldPassword,
          password: passwordData.newPassword,
          confirm_password: passwordData.confirmPassword,
          username: user?.name,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.code === 201) {
        toast.success(data.message || "Password updated successfully!");
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.message  || "Unexpected error occurred");
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Please enter valid old password");
    },
  });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (passwordData.oldPassword === passwordData.newPassword) {
      toast.error("Same Old Password is not allowed");
      return;
    }
    changePasswordMutation.mutate(passwordData);
  };



  return (
    <div className="p-2 max-w-6xl mx-auto ">
    



        <ProfileSetting
  
    passwordData={passwordData}
    setPasswordData={setPasswordData}
    handlePasswordChange={handlePasswordChange}
 
    changePasswordMutation={changePasswordMutation}
 
    
  />
 

  

      


      
    </div>
  );
};

export default Settings;
