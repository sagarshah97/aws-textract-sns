import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Grid,
  Container,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import banner from "../../assets/banner.jpeg";

const ExpenseForm = () => {
  axios.defaults.headers.common = {
    "X-API-Key": process.env.REACT_APP_AWS_API_KEY,
  };

  const baseURL = process.env.REACT_APP_AWS_API_GATEWAY;

  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [emailNotValid, setEmailNotValid] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitAnother, setSubmitAnother] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [key, setKey] = useState("");
  const [base64String, setBase64String] = useState("");

  const [summary, setSummary] = useState({});
  const [expense, setExpense] = useState([]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    const emailValue = e.target.value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(emailValue) || emailValue === "") {
      setEmail(emailValue);
      setEmailNotValid("");
      if (checkValidation()) {
        setShowAlert(false);
      } else {
        setShowAlert(true);
      }
    } else {
      setEmailNotValid("Invalid email address");
    }
  };

  const handleUserIdChange = (e) => {
    setUserId(e.target.value);
    if (checkValidation()) {
      setShowAlert(false);
    } else {
      setShowAlert(true);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    if (e.target.files[0]) {
      setKey(e.target.files[0].name);
      setUploaded(true);
      setUploading(false);
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImageUrl(reader.result);
    };
    reader.onloadend = () => {
      setBase64String(reader.result);
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const checkValidation = () => {
    if (email && userId) {
      return true;
    } else {
      return false;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setShowAlert(false);
    setShowSpinner(true);
    if (checkValidation()) {
      try {
        setSubmitting(true);
        const requestData = {
          image: base64String,
          email,
          userId,
          key: `${Date.now()}-${userId}.${key.split(".")[1]}`,
        };

        const response = await axios.post(baseURL, requestData);

        setSubmitAnother(true);
        setResponseMessage(JSON.parse(response.data.body).extractedDetails);
        setSubmitting(false);
        setSubmitted(true);
        setShowSpinner(false);
        scrollToTop();

        extractInfo(JSON.parse(response.data.body).responseData);
      } catch (error) {
        setSubmitting(false);
        console.error("Error submitting form:", error);
      }
    } else {
      setShowSpinner(false);
      setShowAlert(true);
      scrollToTop();
    }
  };

  const extractInfo = (data) => {
    const summary = data?.summary;
    const expense = data?.expense;

    if (summary && expense) {
      const displaySummary = {
        vendor: summary.find((obj) => obj.key === "VENDOR_NAME")?.value,
        vendorAddress: summary.find((obj) => obj.key === "VENDOR_ADDRESS")
          ?.value,
        receiptDate: summary.find((obj) => obj.key === "INVOICE_RECEIPT_DATE")
          ?.value,
        subTotal: summary.find((obj) => obj.key === "SUBTOTAL")?.value,
        tax: summary.find((obj) => obj.key === "TAX")?.value,
        total: summary.find((obj) => obj.key === "TOTAL")?.value,
      };

      setSummary(displaySummary);
      extractExpenseInfo(expense);
    }
  };

  const extractExpenseInfo = (data) => {
    const expenseInfo = [];
    let item = null;
    let price = null;

    for (const entry of data) {
      if (entry.key === "ITEM") {
        if (item !== null && price !== null) {
          expenseInfo.push({ item, price });
        }
        item = entry.value;
      } else if (entry.key === "PRICE") {
        price = entry.value.replace(/[^0-9.]/g, "");
        price = parseFloat(price);
        if (!isNaN(price)) {
          price = `$${price.toFixed(2)}`;
        } else {
          price = null;
        }
      }
    }

    if (item !== null && price !== null) {
      expenseInfo.push({ item, price });
    }

    setExpense(expenseInfo);
  };

  return (
    <>
      {showSpinner && (
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Box
        style={{
          paddingTop: "5%",
          paddingBottom: "5%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Container
          maxWidth="lg"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Grid
            container
            spacing={2}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                  <Typography
                    variant="h4"
                    textAlign="center"
                    style={{ paddingBottom: "5%", overflowWrap: "anywhere" }}
                  >
                    Expense Reimbursement
                  </Typography>
                  <Typography
                    textAlign="center"
                    style={{
                      paddingBottom: "5%",
                      overflowWrap: "anywhere",
                      fontStyle: "italic",
                      fontSize: "14px",
                    }}
                  >
                    You can submit bills for reimbursement for the items
                    purchased for office utility and supplies.
                  </Typography>
                </Grid>
                {!responseMessage && (
                  <>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                      <TextField
                        label="Email"
                        value={email}
                        onChange={handleEmailChange}
                        type="email"
                        fullWidth
                        error={!!emailNotValid}
                        helperText={emailNotValid}
                      />
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                      <TextField
                        label="Employee Id"
                        value={userId}
                        onChange={handleUserIdChange}
                        fullWidth
                      />
                    </Grid>
                    {showAlert && (
                      <Grid item xs={12} sm={12} md={12} lg={12}>
                        <Typography style={{ color: "red" }}>
                          Please provide all the details correctly.
                        </Typography>
                      </Grid>
                    )}
                  </>
                )}
                <Grid item xs={12} sm={12} md={12} lg={12}>
                  {!responseMessage && (
                    <>
                      <input type="file" onChange={handleFileChange} />
                    </>
                  )}
                  {uploadedImageUrl && (
                    <img
                      src={uploadedImageUrl}
                      alt="Uploaded"
                      style={{ maxWidth: "100%", marginTop: "1rem" }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={!uploaded || submitting || submitted}
                    fullWidth
                  >
                    {submitting
                      ? "Submitting..."
                      : submitted
                      ? "Submitted"
                      : "Submit"}
                  </Button>
                </Grid>
                {submitAnother && (
                  <Grid item xs={12} sm={12} md={12} lg={12}>
                    <Button
                      variant="contained"
                      onClick={() => window.location.reload(true)}
                      fullWidth
                    >
                      Submit another expense
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              md={6}
              lg={6}
              style={{
                display: "flex",
                justifyContent: "center",
                paddingLeft: "3%",
                overflow: "auto",
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12}>
                  {responseMessage && (
                    <>
                      <Grid
                        container
                        spacing={2}
                        style={{ paddingBottom: "6%" }}
                      >
                        <Grid item xs={12}>
                          <Typography
                            style={{ fontStyle: "italic", fontSize: "14px" }}
                            align="center"
                          >
                            The submitted claims will be processed in 7-10
                            business days.
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography
                            style={{
                              fontWeight: 600,
                              fontSize: "1.2rem",
                              padding: "3%",
                              border: "1px solid #eeeeee",
                              borderRadius: "15px",
                              backgroundColor: "#eeeeee",
                              color: "black",
                            }}
                          >
                            USER SUMMARY
                          </Typography>
                        </Grid>
                        <Grid item xs={12} style={{ paddingLeft: "3%" }}>
                          <Typography
                            style={{
                              paddingLeft: "3%",
                            }}
                          >
                            Email: <strong>{email}</strong>
                          </Typography>
                        </Grid>
                        <Grid item xs={12} style={{ paddingLeft: "3%" }}>
                          <Typography
                            style={{
                              paddingLeft: "3%",
                            }}
                          >
                            UserId: <strong>{userId}</strong>
                          </Typography>
                        </Grid>
                      </Grid>
                    </>
                  )}
                  {expense.length > 0 && (
                    <>
                      <Grid container spacing={2} style={{ paddingTop: "6%" }}>
                        <Grid item xs={12}>
                          <Typography
                            style={{
                              fontWeight: 600,
                              fontSize: "1.2rem",
                              padding: "3%",
                              border: "1px solid #eeeeee",
                              borderRadius: "15px",
                              backgroundColor: "#eeeeee",
                              color: "black",
                            }}
                          >
                            EXPENSE SUMMARY
                          </Typography>
                        </Grid>
                        {summary.vendor && (
                          <Grid item xs={12} style={{ paddingLeft: "6%" }}>
                            Vendor: <strong>{summary.vendor}</strong>
                          </Grid>
                        )}
                        {summary.vendorAddress && (
                          <Grid item xs={12} style={{ paddingLeft: "6%" }}>
                            Vendor Address:{" "}
                            <strong>{summary.vendorAddress}</strong>
                          </Grid>
                        )}
                        {summary.receiptDate && (
                          <Grid item xs={12} style={{ paddingLeft: "6%" }}>
                            Receipt Date: <strong>{summary.receiptDate}</strong>
                          </Grid>
                        )}
                        {summary.subTotal && (
                          <Grid item xs={12} style={{ paddingLeft: "6%" }}>
                            Subtotal amount: <strong>{summary.subTotal}</strong>
                          </Grid>
                        )}
                        {summary.tax && (
                          <Grid item xs={12} style={{ paddingLeft: "6%" }}>
                            Tax amount: <strong>{summary.tax}</strong>
                          </Grid>
                        )}
                        {summary.total && (
                          <Grid item xs={12} style={{ paddingLeft: "6%" }}>
                            Total amount: <strong>{summary.total}</strong>
                          </Grid>
                        )}
                      </Grid>
                      <Grid container spacing={2} style={{ paddingTop: "6%" }}>
                        <Grid item xs={12}>
                          <Typography
                            style={{
                              fontWeight: 600,
                              fontSize: "1.2rem",
                              padding: "3%",
                              border: "1px solid #eeeeee",
                              borderRadius: "15px",
                              backgroundColor: "#eeeeee",
                              color: "black",
                            }}
                          >
                            ITEMS PURCHASED
                          </Typography>
                        </Grid>
                        {expense.map((obj) => (
                          <Grid item xs={12} style={{ paddingLeft: "6%" }}>
                            {obj.item}: <strong>{obj.price}</strong>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  )}
                  {!expense.length && responseMessage && (
                    <>
                      <pre>{responseMessage}</pre>
                    </>
                  )}
                  {!responseMessage && (
                    <>
                      <img
                        src={banner}
                        alt="image"
                        style={{
                          maxWidth: "100%",
                          height: "auto",
                        }}
                      />
                      <Typography
                        style={{
                          fontSize: "0.8rem",
                          fontWeight: "200",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        You can view details of your submitted claim here.
                      </Typography>
                      <div style={{ textAlign: "center", paddingTop: "3%" }}>
                        <a
                          style={{
                            fontStyle: "italic",
                            fontSize: "10px",
                          }}
                          href="https://www.freepik.com/free-vector/money-lending-abstract-concept_12084848.htm#query=expense%20claim&position=29&from_view=search&track=ais"
                        >
                          Image by vectorjuice on Freepik
                        </a>{" "}
                      </div>
                    </>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default ExpenseForm;
