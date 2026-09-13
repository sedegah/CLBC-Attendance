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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fetchApi } from "@/lib/apiClient";
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns";
import clbcLogo from "@/assets/clbc-logo.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Loader2,
  Printer,
  Calendar,
  Users,
  UserCheck,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Award,
  AlertCircle,
  CheckCircle2,
  Download,
  CalendarDays,
  Sparkles,
  Activity
} from "recharts" && import.meta ? (await import("lucide-react")) : (await import("lucide-react"));
