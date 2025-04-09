import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import fs from "fs"
import path from "path"
import { promisify } from "util"

const execPromise = promisify(exec)
const writeFilePromise = promisify(fs.writeFile)
const unlinkPromise = promisify(fs.unlink)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File | null
    const videoFile = formData.get("video") as File | null

    if (!audioFile && !videoFile) {
      return NextResponse.json({ error: "No media file provided" }, { status: 400 })
    }

    const tempDir = path.join(process.cwd(), "temp")

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    let tempFilePath: string
    let isVideo = false

    if (audioFile) {
      tempFilePath = path.join(tempDir, `upload_${Date.now()}.mp3`)
      const arrayBuffer = await audioFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      await writeFilePromise(tempFilePath, buffer)
    } else if (videoFile) {
      // Save the video file first
      const videoPath = path.join(tempDir, `upload_${Date.now()}.mp4`)
      const arrayBuffer = await videoFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      await writeFilePromise(videoPath, buffer)

      // Convert video to audio using ffmpeg
      tempFilePath = path.join(tempDir, `audio_${Date.now()}.mp3`)
      isVideo = true

      try {
        await execPromise(`ffmpeg -i "${videoPath}" -q:a 0 -map a "${tempFilePath}"`)

        // Delete the video file after conversion
        await unlinkPromise(videoPath).catch((err) => console.error("Failed to delete temp video file:", err))
      } catch (error) {
        console.error("Error converting video to audio:", error)
        return NextResponse.json(
          {
            error: "Failed to convert video to audio",
            details: {
              message: "Make sure ffmpeg is installed on the server",
              errorDetails: error,
            },
          },
          { status: 500 },
        )
      }
    } else {
      return NextResponse.json({ error: "No valid media file provided" }, { status: 400 })
    }

    const scriptPath = path.join(process.cwd(), "python", "main.py")

    const venvPath = path.join(process.cwd(), ".venv")
    let pythonCommand

    if (process.platform === "win32") {
      pythonCommand = path.join(venvPath, "Scripts", "python.exe")
    } else {
      pythonCommand = path.join(venvPath, "bin", "python")
    }

    if (!fs.existsSync(pythonCommand)) {
      console.warn(`Virtual env Python not found at ${pythonCommand}, falling back to system Python`)
      pythonCommand = "python"
    }

    console.log(`Executing: ${pythonCommand} ${scriptPath} --input="${tempFilePath}"`)

    try {
      const { stdout, stderr } = await execPromise(`"${pythonCommand}" "${scriptPath}" --input="${tempFilePath}"`)

      if (stderr) {
        console.error("Python stderr:", stderr)
      }

      await unlinkPromise(tempFilePath).catch((err) => console.error("Failed to delete temp file:", err))

      return NextResponse.json({
        result: stdout.trim(),
        source: isVideo ? "video" : "audio",
      })
    } catch (error) {
      console.error("Python execution error:", error)

      return NextResponse.json(
        {
          error: "Failed to process media",
          details: error,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing media:", error)
    return NextResponse.json({ error: "Failed to process media", details: error }, { status: 500 })
  }
}
