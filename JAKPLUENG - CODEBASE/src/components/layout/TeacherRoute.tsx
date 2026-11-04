import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function TeacherRoute({ children }: { children: React.ReactNode }) {
  const { isTeacher, isLoading, isStudent } = useAuth()
  
  // Show loading max 3 seconds then redirect
  const [timedOut, setTimedOut] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 3000)
    return () => clearTimeout(timer)
  }, [])
  
  if (isLoading && !timedOut) return (
    <div style={{
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      height:'100vh', background:'#FFFEF7',
      gap: '1rem'
    }}>
      <div style={{fontWeight:900, fontSize:'24px'}}>
        🔄 Memuat Dashboard...
      </div>
      <div style={{fontSize:'14px', color:'#666'}}>
        isLoading: {String(isLoading)} | 
        isTeacher: {String(isTeacher)} | 
        isStudent: {String(isStudent)}
      </div>
    </div>
  )
  
  // ✅ FIX: Check if user is a student first and redirect to student page
  if (isStudent) return <Navigate to="/student/group" replace />
  
  // Then check if user is not a teacher and redirect to admin login
  if (!isTeacher) return <Navigate to="/admin/login" replace />
  
  return <>{children}</>
}
