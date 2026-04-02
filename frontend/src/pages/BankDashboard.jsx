import Navbar from "../components/Navbar";
import API from "../services/api";

function BankDashboard() {

  const uploadModel = async () => {
  const fileInput = document.getElementById("file");

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    await API.post("/training/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    alert("Upload success");

  } catch (err) {
    alert("Upload failed");
  }
};

  return (
    <div>
      <Navbar />
      <h2>Bank Admin Dashboard</h2>

      <input type="file" id="file" />
      <button onClick={uploadModel}>Upload Model</button>
    </div>
  );
}

export default BankDashboard;