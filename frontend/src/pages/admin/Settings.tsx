import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuthStore } from "@/stores/auth"
import { useTheme } from "@/contexts/ThemeContext"
import { Lock, Globe, Palette, Bell, Settings as SettingsIcon } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { authService } from "../../services/authService"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Settings() {
  const { theme, toggleTheme } = useTheme()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords do not match")
      return
    }
    
    setIsSubmitting(true)
    try {
      await authService.changePassword(passwords.current, passwords.new)
      toast.success("Password updated successfully")
      setIsChangingPassword(false)
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-dark dark:text-white flex items-center gap-3">
          <SettingsIcon className="text-primary dark:text-accent" />
          System Settings
        </h1>
        <p className="text-muted-foreground font-medium">Configure global system parameters and preferences.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-muted/5">
            <div className="flex items-center gap-3">
              <Globe className="text-blue-500" size={20} />
              <CardTitle className="text-lg">General Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" defaultValue="Sovereign Audit AI" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="system-email">System Email</Label>
                <Input id="system-email" defaultValue="admin@sovereign-audit.ai" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-muted/5">
            <div className="flex items-center gap-3">
              <Lock className="text-red-500" size={20} />
              <CardTitle className="text-lg">Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Change Password</Label>
                <p className="text-xs text-muted-foreground">Update your account password.</p>
              </div>
              <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-full">Change Password</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePasswordChange} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input 
                        id="current-password" 
                        type="password" 
                        value={passwords.current}
                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input 
                        id="new-password" 
                        type="password" 
                        value={passwords.new}
                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                        required 
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Updating..." : "Update Password"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-muted/5">
            <div className="flex items-center gap-3">
              <Palette className="text-purple-500" size={20} />
              <CardTitle className="text-lg">Appearance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Dark Mode</Label>
                <p className="text-xs text-muted-foreground">Toggle between light and dark themes.</p>
              </div>
                <Checkbox 
                  id="dark-mode" 
                  checked={theme === 'dark'} 
                  onCheckedChange={toggleTheme}
                />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base" htmlFor="compact-view">Compact View</Label>
                <p className="text-xs text-muted-foreground">Reduce whitespace in tables and lists.</p>
              </div>
              <Checkbox id="compact-view" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-muted/5">
            <div className="flex items-center gap-3">
              <Bell className="text-amber-500" size={20} />
              <CardTitle className="text-lg">Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base" htmlFor="email-alerts">Email Alerts</Label>
                <p className="text-xs text-muted-foreground">Send email for critical system events.</p>
              </div>
              <Checkbox id="email-alerts" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base" htmlFor="browser-notifications">Browser Notifications</Label>
                <p className="text-xs text-muted-foreground">Show desktop notifications for new requests.</p>
              </div>
              <Checkbox id="browser-notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" className="rounded-full px-8">CANCEL</Button>
          <Button className="rounded-full px-8 font-bold shadow-elevated">SAVE CHANGES</Button>
        </div>
      </div>
    </div>
  );
}
