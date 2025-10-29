import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BASE_URL from "@/config/base-url";
import { ButtonConfig } from "@/config/button-config";

import axios from "axios";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
const ChangePassword = ({ open, setOpen }) => {

  const [isLoading, setIsLoading] = useState();
  const username = Cookies.get("name");
  const [formData, setFormData] = useState({
    name: username,
    currentPassword: "",
    newPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const missingFields = [];
    if (!formData.name) missingFields.push("Name");
    if (!formData.currentPassword) missingFields.push("Current Password");
    if (!formData.newPassword) missingFields.push("New Password");

    if (missingFields.length > 0) {
      toast.error(
       "Validation Error");
      return;
    }

    setIsLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await axios.post(
        `${BASE_URL}/api/web-change-password`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data.code == 200) {
        toast.success(response.data.msg || 'Updated Successfuly');

        setFormData({
          name: "",
          currentPassword: "",
          newPassword: "",
        });
        setOpen(false);
      } else {
        toast.error(response.data.msg || 'Error');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="w-full max-w-xs sm:max-w-md"
        aria-describedby={null}
      >
        <DialogHeader>
          <DialogTitle>Change Password </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="Enter Current Password (max-16)"
              type="password"
              maxLength={16}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter New Password (max-16)"
              type="password"
              maxLength={16}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePassword;
