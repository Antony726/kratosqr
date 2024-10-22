const video = document.getElementById('video');
        const resultDiv = document.getElementById('result');

        // Check for available video devices
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const backCamera = devices.find(device => device.kind === 'videoinput' && device.label.toLowerCase().includes('environment'));
                console.log('Available devices:', devices);
                
                // If a back camera is found, use it
                if (backCamera) {
                    startCamera(backCamera.deviceId);
                } else {
                    console.error('No back camera found. Using default camera.');
                    startCamera(); // Use default camera
                }
            })
            .catch(err => {
                console.error("Error accessing media devices: ", err);
            });

        function startCamera(deviceId) {
            const constraints = {
                video: {
                    facingMode: deviceId ? { exact: deviceId } : 'user' // 'user' for front camera
                }
            };

            navigator.mediaDevices.getUserMedia(constraints)
                .then(stream => {
                    video.srcObject = stream;
                })
                .catch(err => {
                    console.error("Error accessing the camera: ", err);
                });
        }

        // Function to capture image and scan QR code
        document.getElementById('scan-button').addEventListener('click', () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // Set canvas dimensions to match video dimensions
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw the video frame to the canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);

            if (code) {
                const qrData = JSON.parse(code.data);
                checkValidity(qrData);
            } else {
                alert("No QR code found. Please try again.");
            }
        });

        function checkValidity(qrData) {
            const emailID = qrData.teamLeader; // Assuming teamLeader is unique
            const hasScanned = localStorage.getItem(emailID);

            if (hasScanned) {
                alert("This QR code has already been used!");
            } else {
                localStorage.setItem(emailID, 'scanned');
                displayDetails(qrData);
            }
        }

        function displayDetails(qrData) {
            resultDiv.innerHTML = `
                <h2>Details</h2>
                <p><strong>Event Name:</strong> ${qrData.eventName}</p>
                <p><strong>Team Name:</strong> ${qrData.teamName}</p>
                <p><strong>Team Leader:</strong> ${qrData.teamLeader}</p>
                <p><strong>Team Members:</strong> ${qrData.teamMembers.join(', ')}</p>
            `;
        }
