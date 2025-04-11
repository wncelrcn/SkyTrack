"use client";
import React from "react";
import { Box, List, ListItem, ListItemIcon } from "@mui/material";
import { styled } from "@mui/material/styles";
import Link from "next/link";
import GridViewIcon from "@mui/icons-material/GridView";
import BarChartIcon from "@mui/icons-material/BarChart";

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: "120px",
  height: "100vh",
  backgroundColor: "white",
  borderRight: `1px solid ${theme.palette.divider}`,
  position: "fixed",
  left: 0,
  top: 0,
  display: "flex",
  flexDirection: "column",
  borderRadius: "15px",
  padding: theme.spacing(2),
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.08)",
}));

const LogoWrapper = styled("div")({
  width: "60px",
  height: "60px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
  marginBottom: "40px",
  marginTop: "20px",
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
});

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: "12px",
  height: "80px",
  display: "flex",
  justifyContent: "center",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const Sidebar = () => {
  return (
    <SidebarContainer>
      <Box sx={{ mb: 6 }}>
        <LogoWrapper>
          <img src="/weather-logo.png" alt="logo" />
        </LogoWrapper>
      </Box>

      <List sx={{ p: 0, flexGrow: 1 }}>
        <StyledListItem>
          <ListItemIcon sx={{ minWidth: "auto" }}>
            <Link href="/" passHref>
              <GridViewIcon
                sx={{ color: "#023E8A", fontSize: "40px", cursor: "pointer" }}
              />
            </Link>
          </ListItemIcon>
        </StyledListItem>

        <StyledListItem>
          <ListItemIcon sx={{ minWidth: "auto" }}>
            <Link href="/details" passHref>
              <BarChartIcon
                sx={{ color: "#023E8A", fontSize: "40px", cursor: "pointer" }}
              />
            </Link>
          </ListItemIcon>
        </StyledListItem>
      </List>
    </SidebarContainer>
  );
};

export default Sidebar;
