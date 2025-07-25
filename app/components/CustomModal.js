import * as React from "react";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 350,
  minWidth: "fit-content",
  maxHeight: "70vh",
  bgcolor: "#6e00ff", // Changed background color to purple
  // border: '2px solid #000',
  border: "none",
  borderRadius: "4px",
  boxShadow: 24,
  p: 4,
  color: "white", // Changed text color to white for better contrast
  outline: 0,
  overflow: "auto",
};

export default function CustomModal({ isOpen, closeModal, hypothesis }) {
  return (
    <div>
      {/* <Button onClick={handleOpen}>Open modal</Button> */}
      <Modal
        open={isOpen}
        onClose={closeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Button
            onClick={closeModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "white", // Changed button text color to purple
              // backgroundColor: 'white', // Changed button background to white
              minWidth: "auto",
              // width: 'fit-content',
              padding: "4px 12px",
              borderRadius: "50%",
              "&:hover": {
                backgroundColor: "lightgray", // Optional: change hover color for better visibility
                color: "black",
              },
            }}
          >
            X
          </Button>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            Comments Activity Instructions
          </Typography>

          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h3"
            sx={{ mb: 2 }}
          >
            You&apos;ll be provided with a programming project and tasked with
            adding comments & docstrings. This happens via the following steps:
            <ul style={{ paddingLeft: "20px", lineHeight: "1.6" }}>
              <li style={{ marginBottom: "12px" }}>
                Select a function somewhere in the programming project.
              </li>
              <li style={{ marginBottom: "12px" }}>
                Write a docstring for this function, or select and fill in a
                template docstring.{" "}
              </li>
              <li style={{ marginBottom: "12px" }}>
                Answer some questions which ensure that the docstring
                accomplishes a number of goals.
              </li>
              <li style={{ marginBottom: "12px" }}>
                Select places to put in-line comments within that function.
              </li>
              <li style={{ marginBottom: "12px" }}>
                Select from one of two possible comments for each selected
                place, or compose your own.
              </li>
            </ul>
            Once you&apos;re done commenting on the function, you&apos;ll be
            shown an example solution we prepared.
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
