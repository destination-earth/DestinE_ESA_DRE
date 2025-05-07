import React from "react";
import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { solarFaqs, windFaqs, generalFaqs } from "../faqs/FaqText";

const FaqPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        sx={{ mb: 8 }}
      >
        <strong>Frequently Asked Questions</strong>
      </Typography>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        sx={{ mb: 4, ml: 8, textAlign: 'left' }}
      >
        1. General
      </Typography>
      <Box sx={{ maxWidth: "800px", margin: "0 auto" }}>
        {generalFaqs.map((faq, index) => (
          <Accordion
            key={index}
            sx={{
              mb: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              "&:before": { display: "none" }, // Remove default top border
              "&.Mui-expanded": {
                margin: "16px 0", // Adjust margin when expanded
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}a-content`}
              id={`panel${index}a-header`}
              sx={{
                backgroundColor: "#f8f9fa",
                minHeight: "64px",
                "& .MuiAccordionSummary-content": {
                  margin: "12px 0",
                },
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: "bold" }}
              >
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{ backgroundColor: "#ffffff", padding: "16px" }}
            >
              <Box
                component="div"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        sx={{ mb: 4, mt: 10, ml: 8, textAlign: 'left' }}
      >
        2. Solar Services
      </Typography>
      <Box sx={{ maxWidth: "800px", margin: "0 auto" }}>
        {solarFaqs.map((faq, index) => (
          <Accordion
            key={index}
            sx={{
              mb: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              "&:before": { display: "none" }, // Remove default top border
              "&.Mui-expanded": {
                margin: "16px 0", // Adjust margin when expanded
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}a-content`}
              id={`panel${index}a-header`}
              sx={{
                backgroundColor: "#f8f9fa",
                minHeight: "64px",
                "& .MuiAccordionSummary-content": {
                  margin: "12px 0",
                },
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: "bold" }}
              >
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{ backgroundColor: "#ffffff", padding: "16px" }}
            >
              <Box
                component="div"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        sx={{ mb: 4,mt: 10, ml: 8, textAlign: 'left' }}
      >
        3. Wind Services
      </Typography>
      <Box sx={{ maxWidth: "800px", margin: "0 auto" }}>
        {windFaqs.map((faq, index) => (
          <Accordion
            key={index}
            sx={{
              mb: 2,
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              "&:before": { display: "none" }, // Remove default top border
              "&.Mui-expanded": {
                margin: "16px 0", // Adjust margin when expanded
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}a-content`}
              id={`panel${index}a-header`}
              sx={{
                backgroundColor: "#f8f9fa",
                minHeight: "64px",
                "& .MuiAccordionSummary-content": {
                  margin: "12px 0",
                },
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: "bold" }}
              >
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{ backgroundColor: "#ffffff", padding: "16px" }}
            >
              <Box
                component="div"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
};

export default FaqPage;
