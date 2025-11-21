import { GoogleGenAI } from "@google/genai";
import { Student, AttendanceRecord } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateStudentReport = async (
  student: Student,
  attendance: AttendanceRecord[],
  additionalNotes: string
): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please configure the environment variable.";
  }

  // Calculate basic stats
  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'Present').length;
  const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const prompt = `
    You are an administrator at "Noor ul Masajid Islamic Education System". 
    Write a polite, formal, and encouraging progress report message for a parent regarding their child.
    
    Student Name: ${student.fullName}
    Class: ${student.className} (${student.track})
    Attendance: ${percentage}% (${presentDays}/${totalDays} days present)
    Teacher's Notes: ${additionalNotes}
    
    The message should be formatted to be sent via WhatsApp. 
    Start with "Assalamu Alaikum,".
    Include the attendance summary.
    Mention the specific class progress based on the track (Hifz or Dars-e-Nizami).
    End with a dua.
    Keep it concise but warm.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate report.";
  } catch (error) {
    console.error("Error generating report:", error);
    return "Error generating report due to network or API issues.";
  }
};