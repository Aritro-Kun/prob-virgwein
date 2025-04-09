"use client"

import { useRef } from "react"
import { jsPDF } from "jspdf"
import ReactMarkdown from "react-markdown"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ReportDisplayProps {
  content: string
}

export default function ReportDisplay({ content }: ReportDisplayProps) {
  const reportRef = useRef<HTMLDivElement>(null)

  // Custom components for styling our markdown
  const MarkdownComponents = {
    h1: ({ node, ...props }: any) => (
      <h1 {...props} className="text-3xl font-bold text-gray-800 mb-4" />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 {...props} className="text-2xl font-bold text-gray-800 mt-6 mb-3" />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 {...props} className="text-xl font-bold text-gray-700 mt-4 mb-2" />
    ),
    p: ({ node, ...props }: any) => (
      <p {...props} className="text-gray-600 mb-2" />
    ),
    ul: ({ node, ...props }: any) => (
      <ul {...props} className="ml-5 mb-4" />
    ),
    li: ({ node, ...props }: any) => (
      <li {...props} className="flex mb-2">
        <span className="mr-2">•</span>
        <span className="text-gray-600 flex-1">{props.children}</span>
      </li>
    )
  }

  // PDF generation function
  const downloadAsPDF = () => {
    try {
      const pdf = new jsPDF()

      // Add title
      pdf.setFontSize(18)
      pdf.text("Hospital Analysis Report", 20, 20)

      // Set font for content
      pdf.setFontSize(12)
      let yPosition = 30

      // Process content line by line for PDF generation
      const lines = content.split("\n")

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        if (!line) {
          yPosition += 3
          continue
        }

        // Check if we need a new page
        if (yPosition > 270) {
          pdf.addPage()
          yPosition = 20
        }

        // Handle headers
        if (line.startsWith("#")) {
          const level = line.match(/^#+/)?.[0]?.length || 1
          const title = line.replace(/^#+\s*/, "")

          if (level === 1) {
            pdf.setFontSize(16)
            pdf.setFont("helvetica", "bold")
            pdf.text(title, 20, yPosition)
            yPosition += 10
          } else {
            pdf.setFontSize(14)
            pdf.setFont("helvetica", "bold")
            pdf.text(title, 20, yPosition)
            yPosition += 8
          }
          pdf.setFontSize(12)
          pdf.setFont("helvetica", "normal")
          continue
        }

        // Handle bullets
        if (line.startsWith("* ")) {
          const bulletText = line.substring(2)

          // Section headings with asterisks
          if (bulletText.startsWith("*") && bulletText.includes(":**")) {
            const titleMatch = bulletText.match(/\*([^:]+):\*\*/)
            if (titleMatch) {
              pdf.setFont("helvetica", "bold")
              pdf.text(`• ${titleMatch[1].trim()}:`, 20, yPosition)
              pdf.setFont("helvetica", "normal")
              yPosition += 6
            }
          }
          // Bullet points with labels
          else if (bulletText.includes(":") && !bulletText.startsWith("*")) {
            const [label, value] = bulletText.split(":", 2)
            pdf.text("•", 20, yPosition)
            pdf.setFont("helvetica", "bold")
            pdf.text(`${label.trim()}:`, 25, yPosition)
            pdf.setFont("helvetica", "normal")

            if (value && value.trim()) {
              const wrappedText = pdf.splitTextToSize(value.trim(), 150)
              pdf.text(wrappedText, 25, yPosition + 6)
              yPosition += 6 * (wrappedText.length + 1)
            } else {
              yPosition += 6
            }
          }
          // Regular bullet points
          else {
            const wrappedText = pdf.splitTextToSize(bulletText, 150)
            pdf.text("•", 20, yPosition)
            pdf.text(wrappedText, 25, yPosition)
            yPosition += 6 * wrappedText.length
          }
          continue
        }

        // Regular text
        const wrappedText = pdf.splitTextToSize(line, 170)
        pdf.text(wrappedText, 20, yPosition)
        yPosition += 6 * wrappedText.length
      }

      pdf.save("hospital-analysis-report.pdf")
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between bg-gray-50 border-b">
        <h2 className="text-xl font-bold text-gray-800">Hospital Analysis Report</h2>
        <Button onClick={downloadAsPDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </CardHeader>

      <CardContent className="p-6">
        <div ref={reportRef} className="max-w-4xl mx-auto">
          <ReactMarkdown components={MarkdownComponents}>
            {content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  )
}