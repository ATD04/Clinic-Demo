import { BrowserRouter, Route, Routes } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ClinicDataProvider } from "@/data/ClinicDataContext"
import { ToastProvider } from "@/hooks/use-toast"
import { AppointmentsPage } from "@/pages/Appointments"
import { CommunicationPage } from "@/pages/Communication"
import { Dashboard } from "@/pages/Dashboard"
import { DoctorsPage } from "@/pages/Doctors"
import { FinancePage } from "@/pages/Finance"
import { InventoryPage } from "@/pages/Inventory"
import { PatientPortal } from "@/pages/PatientPortal"
import { PatientsPage } from "@/pages/Patients"
import { SettingsPage } from "@/pages/Settings"

function App() {
  return (
    <ToastProvider>
      <ClinicDataProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/portal" element={<PatientPortal />} />
              <Route element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="appointments" element={<AppointmentsPage />} />
                <Route path="patients" element={<PatientsPage />} />
                <Route path="doctors" element={<DoctorsPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="finance" element={<FinancePage />} />
                <Route path="communication" element={<CommunicationPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        <Toaster />
      </ClinicDataProvider>
    </ToastProvider>
  )
}

export default App
