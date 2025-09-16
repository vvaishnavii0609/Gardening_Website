// Plant identification endpoint - handles both file uploads and base64 images
app.post("/api/identify-plant", upload.single("image"), async (req, res) => {
  try {
    let imageData;
    
    // Handle file upload (from main branch)
    if (req.file) {
      console.log("Uploaded file:", req.file);
      imageData = req.file.path; // Use file path for uploaded files
    } 
    // Handle base64 image (from request body)
    else if (req.body.image) {
      imageData = req.body.image; // Use base64 data directly
    } 
    else {
      return res.status(400).json({ 
        success: false, 
        message: "No image uploaded or provided" 
      });
    }
    
    // Call Python plant identification service
    const pythonProcess = spawn('python3', ['ml/plantIdentification.py']);
    
    // Send appropriate data based on input type
    const inputData = req.file 
      ? { imagePath: imageData }  // File path for uploaded files
      : { image: imageData };     // Base64 for direct image data
    
    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();
    
    let result = '';
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const identification = JSON.parse(result);
          res.json(identification);
        } catch (parseError) {
          console.error('Failed to parse Python response:', result);
          res.status(500).json({ 
            success: false, 
            message: "Invalid response from identification service" 
          });
        }
      } else {
        console.error('Python process exited with code:', code);
        res.status(500).json({ 
          success: false, 
          message: "Plant identification failed" 
        });
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('Python process error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to start identification service" 
      });
    });
  } catch (error) {
    console.error("Plant identification error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});