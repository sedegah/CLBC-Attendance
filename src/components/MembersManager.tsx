import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Users, 
  UserPlus, 
  Upload,
  Trash2,
  Edit2,
  Cake,
  Loader2,
  Search
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { format, parse, isValid } from "date-fns";

interface Member {
  id: string;
  full_name: string;
  birthday: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
}

const MembersManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  // Form state
  const [formName, setFormName] = useState("");
  const [formBirthday, setFormBirthday] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("full_name", { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error",
        description: "Failed to load members.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMember = async () => {
    if (!user || !formName.trim()) {
      toast({
        title: "Validation error",
        description: "Name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingMember) {
        const { error } = await supabase
          .from("members")
          .update({
            full_name: formName.trim(),
            birthday: formBirthday || null,
            phone: formPhone.trim() || null,
            email: formEmail.trim() || null,
          })
          .eq("id", editingMember.id);

        if (error) throw error;
        toast({ title: "Member updated" });
      } else {
        const { error } = await supabase
          .from("members")
          .insert({
            user_id: user.id,
            full_name: formName.trim(),
            birthday: formBirthday || null,
            phone: formPhone.trim() || null,
            email: formEmail.trim() || null,
          });

        if (error) throw error;
        toast({ title: "Member added" });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchMembers();
    } catch (error: any) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save member.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (member: Member) => {
    try {
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", member.id);

      if (error) throw error;
      toast({ title: "Member deleted" });
      fetchMembers();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete member.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormName(member.full_name);
    setFormBirthday(member.birthday || "");
    setFormPhone(member.phone || "");
    setFormEmail(member.email || "");
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingMember(null);
    setFormName("");
    setFormBirthday("");
    setFormPhone("");
    setFormEmail("");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      const membersToInsert: any[] = [];

      jsonData.forEach((row: any) => {
        const name = row.Name || row.name || row["Full Name"] || row.full_name || row.FullName || "";
        if (!name) return;

        let birthdayStr = row.Birthday || row.birthday || row.DOB || row.dob || row["Date of Birth"] || "";
        let birthday: string | null = null;

        if (birthdayStr) {
          // Handle Excel serial date numbers
          if (typeof birthdayStr === "number") {
            const excelEpoch = new Date(1899, 11, 30);
            const date = new Date(excelEpoch.getTime() + birthdayStr * 86400000);
            birthday = format(date, "yyyy-MM-dd");
          } else {
            // Try common date formats
            const formats = ["MM/dd/yyyy", "dd/MM/yyyy", "yyyy-MM-dd", "MM-dd-yyyy", "dd-MM-yyyy"];
            for (const fmt of formats) {
              const parsed = parse(birthdayStr, fmt, new Date());
              if (isValid(parsed)) {
                birthday = format(parsed, "yyyy-MM-dd");
                break;
              }
            }
          }
        }

        membersToInsert.push({
          user_id: user.id,
          full_name: String(name).trim(),
          birthday,
          phone: row.Phone || row.phone || row.Mobile || row.mobile || null,
          email: row.Email || row.email || null,
        });
      });

      if (membersToInsert.length === 0) {
        toast({
          title: "No valid data",
          description: "No members found in the file. Ensure there's a 'Name' column.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("members")
        .insert(membersToInsert);

      if (error) throw error;

      toast({
        title: "Import successful",
        description: `Added ${membersToInsert.length} members from file.`,
      });

      fetchMembers();
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: error.message || "Failed to import members.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get upcoming birthdays (next 30 days)
  const today = new Date();
  const upcomingBirthdays = members
    .filter(m => m.birthday)
    .map(m => {
      const bday = new Date(m.birthday!);
      const thisYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
      if (thisYearBday < today) {
        thisYearBday.setFullYear(today.getFullYear() + 1);
      }
      const daysUntil = Math.ceil((thisYearBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...m, daysUntil };
    })
    .filter(m => m.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Church Members</h2>
            <p className="text-sm text-muted-foreground">{members.length} total members</p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/30 border-border/40"
            />
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingMember ? "Edit Member" : "Add New Member"}</DialogTitle>
                <DialogDescription>
                  {editingMember ? "Update member information." : "Add a new member to your church directory."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formBirthday}
                    onChange={(e) => setFormBirthday(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveMember}>
                  {editingMember ? "Update" : "Add Member"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Import Card */}
        <Card className="border-border/40 border-dashed border-2 hover:border-primary/40 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Import Members</CardTitle>
                <CardDescription className="text-xs">From Excel/CSV</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="cursor-pointer bg-muted/30 border-border/40 file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:cursor-pointer text-sm"
            />
            {isUploading && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 text-primary text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Importing...</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Include "Name" and "Birthday" columns.
            </p>
          </CardContent>
        </Card>

        {/* Upcoming Birthdays */}
        <Card className="lg:col-span-2 border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Cake className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-base">Upcoming Birthdays</CardTitle>
                <CardDescription className="text-xs">Next 30 days</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingBirthdays.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming birthdays</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {upcomingBirthdays.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 text-sm">
                    <Cake className="h-4 w-4 text-accent" />
                    <span className="font-medium">{m.full_name}</span>
                    <span className="text-muted-foreground">
                      {m.daysUntil === 0 ? "Today!" : m.daysUntil === 1 ? "Tomorrow" : `in ${m.daysUntil} days`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card className="border-border/40">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {searchQuery ? "No members found" : "No members yet"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Try a different search term." : "Add members manually or import from Excel."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold">Name</TableHead>
                    <TableHead className="text-xs font-semibold">Birthday</TableHead>
                    <TableHead className="text-xs font-semibold hidden md:table-cell">Phone</TableHead>
                    <TableHead className="text-xs font-semibold hidden lg:table-cell">Email</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id} className="border-border/40 hover:bg-muted/30">
                      <TableCell className="py-3 font-medium">{member.full_name}</TableCell>
                      <TableCell className="py-3">
                        {member.birthday ? (
                          <span className="text-sm">
                            {format(new Date(member.birthday), "MMM dd, yyyy")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {member.phone || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground truncate max-w-[150px] block">
                          {member.email || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-secondary/10 hover:text-secondary"
                            onClick={() => handleEdit(member)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(member)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MembersManager;