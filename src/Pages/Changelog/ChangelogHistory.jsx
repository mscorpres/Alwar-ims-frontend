import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";
import { Select, DatePicker, Button, Tag } from "antd";
import { PlayCircleOutlined, FileTextOutlined, DownOutlined, UpOutlined, SearchOutlined, ReloadOutlined, DownloadOutlined } from "@ant-design/icons";
import { imsAxios } from "../../axiosInterceptor";
import { toast } from "react-toastify";
import dayjs from "dayjs";

// Sample data - replace with API data
const sampleChangelogData = [
  {
    id: 1,
    date: "2025-01-15",
    title: "NewNew Dashboard FeaturesNew Dashboard FeaturesNew Dashboard FeaturesNew Dashboard FeaturesNew Dashboard FeaturesNew Dashboard Features Dashboard Features",
    description: [
      "Added new analytics widgets with real-time data visualization",
      "Improved chart rendering performance by 40%",
      "Fixed dashboard loading issues on slow networks",
      "Added customizable widget layouts",
      "New export functionality for reports",
      "Improved chart rendering performance by 40%",
      "Fixed dashboard loading issues on slow networks",
      "Added customizable widget layouts",
      "New export functionality for reports",
    ],
    videoUrl: "https://www.youtube.com/watch?v=example1",
    docUrl: "https://docs.example.com/dashboard-guide",
  },
  {
    id: 2,
    date: "2025-01-10",
    title: "Bug Fixes & Improvements",
    description: [
      "Fixed login session timeout issue that was causing users to be logged out unexpectedly after 30 minutes of inactivity",
      "Improved form validation with better error messages",
      "Updated notification system with push notifications support",
    ],
    videoUrl: null,
    docUrl: "https://docs.example.com/bugfixes",
  },
  {
    id: 3,
    date: "2025-01-05",
    title: "Security Updates",
    description: [
      "Enhanced password encryption using bcrypt with higher salt rounds",
      "Added two-factor authentication via SMS and authenticator apps",
      "Fixed XSS vulnerabilities in user input fields",
      "Implemented CSRF token protection",
      "Added rate limiting for API endpoints",
      "Security audit completed with all critical issues resolved",
    ],
    videoUrl: "https://www.youtube.com/watch?v=example3",
    docUrl: null,
  },
  {
    id: 4,
    date: "2024-12-20",
    title: "UI Enhancements",
    description: [
      "New sidebar design with collapsible menu",
      "Improved mobile responsiveness across all pages",
      "Dark mode support added with system preference detection",
    ],
    videoUrl: null,
    docUrl: null,
  },
  {
    id: 5,
    date: "2024-12-10",
    title: "Performance Optimization",
    description:
      "This release includes major performance improvements. We reduced API response time by implementing efficient caching mechanisms and optimized database queries. The application now loads 50% faster on initial page load. Memory usage has been reduced by 30% through better garbage collection and resource management. Additionally, we implemented lazy loading for images and components to improve perceived performance.",
    videoUrl: "https://www.youtube.com/watch?v=example5",
    docUrl: "https://docs.example.com/performance",
  },
  {
    id: 6,
    date: "2024-11-25",
    title: "New Module Release",
    description: [
      "Launched inventory management module",
      "Added stock tracking features",
      "Integrated barcode scanning",
    ],
    videoUrl: null,
    docUrl: null,
  },
];

// Component for expandable description
const ExpandableDescription = ({ description, maxLines = 3 }) => {
  const [expanded, setExpanded] = useState(false);
  const isArray = Array.isArray(description);
  const shouldTruncate = isArray
    ? description.length > maxLines
    : description.length > 200;

  const displayContent = () => {
    if (isArray) {
      const items = expanded ? description : description.slice(0, maxLines);
      return items.map((line, idx) => (
        <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
          • {line}
        </Typography>
      ));
    } else {
      if (!shouldTruncate || expanded) {
        return <Typography variant="body2">{description}</Typography>;
      }
      return (
        <Typography variant="body2">
          {description.substring(0, 200)}...
        </Typography>
      );
    }
  };

  return (
    <Box>
      <Box sx={{ color: "#666" }}>{displayContent()}</Box>
      {shouldTruncate && (
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            mt: 1,
            color: "#047780",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 500,
            "&:hover": {
              textDecoration: "underline",
            },
          }}
        >
          {expanded ? (
            <>
              Show less <UpOutlined style={{ fontSize: 12 }} />
            </>
          ) : (
            <>
              Show more <DownOutlined style={{ fontSize: 12 }} />
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

const ChangelogHistory = () => {
  const [loading, setLoading] = useState(false);
  const [changelogData, setChangelogData] = useState(sampleChangelogData);
  const [filteredData, setFilteredData] = useState(sampleChangelogData);

  // Filter states
  const [filterYear, setFilterYear] = useState(null);
  const [filterMonth, setFilterMonth] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [filterHaving, setFilterHaving] = useState([]);

  // Get unique years from data
  const yearOptions = useMemo(() => {
    const years = [...new Set(changelogData.map((item) => new Date(item.date).getFullYear()))];
    return years.sort((a, b) => b - a).map((year) => ({ label: year.toString(), value: year }));
  }, [changelogData]);

  // Month options
  const monthOptions = [
    { label: "January", value: 0 },
    { label: "February", value: 1 },
    { label: "March", value: 2 },
    { label: "April", value: 3 },
    { label: "May", value: 4 },
    { label: "June", value: 5 },
    { label: "July", value: 6 },
    { label: "August", value: 7 },
    { label: "September", value: 8 },
    { label: "October", value: 9 },
    { label: "November", value: 10 },
    { label: "December", value: 11 },
  ];

  // Handle filter search
  const handleSearch = () => {
    let result = [...changelogData];

    // Filter by year
    if (filterYear) {
      result = result.filter((item) => new Date(item.date).getFullYear() === filterYear);
    }

    // Filter by month
    if (filterMonth !== null) {
      result = result.filter((item) => new Date(item.date).getMonth() === filterMonth);
    }

    // Filter by exact date
    if (filterDate) {
      const selectedDate = filterDate.format("YYYY-MM-DD");
      result = result.filter((item) => item.date === selectedDate);
    }

    // Filter by having (Doc/Video)
    if (filterHaving.length > 0) {
      result = result.filter((item) => {
        if (filterHaving.includes("doc") && filterHaving.includes("video")) {
          return item.docUrl && item.videoUrl;
        }
        if (filterHaving.includes("doc")) {
          return item.docUrl;
        }
        if (filterHaving.includes("video")) {
          return item.videoUrl;
        }
        return true;
      });
    }

    setFilteredData(result);
  };

  // Handle reset
  const handleReset = () => {
    setFilterYear(null);
    setFilterMonth(null);
    setFilterDate(null);
    setFilterHaving([]);
    setFilteredData(changelogData);
  };

  // Toggle having filter
  const toggleHaving = (type) => {
    if (filterHaving.includes(type)) {
      setFilterHaving(filterHaving.filter((h) => h !== type));
    } else {
      setFilterHaving([...filterHaving, type]);
    }
  };

  // Group data by year and month
  const groupByYearAndMonth = (data) => {
    const grouped = {};

    data.forEach((item) => {
      const date = new Date(item.date);
      const year = date.getFullYear();
      const month = date.toLocaleString("default", { month: "long" });

      if (!grouped[year]) {
        grouped[year] = {};
      }
      if (!grouped[year][month]) {
        grouped[year][month] = [];
      }
      grouped[year][month].push(item);
    });

    return grouped;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: date.toLocaleString("default", { month: "short" }).toUpperCase(),
      year: date.getFullYear(),
    };
  };

  const groupedData = groupByYearAndMonth(filteredData);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary">
          Loading changelog history...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        p: 3,
        height: "calc(100vh - 100px)",
      }}
    >
      {/* Left Section - Timeline */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          pr: 2,
        }}
      >
        {/* Page Title */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#047780",
            }}
          >
            Changelog History
          </Typography>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            style={{
              backgroundColor: "#047780",
              borderColor: "#047780",
              height: 36,
            }}
          >
            Download
          </Button>
        </Box>

        {filteredData.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="textSecondary">
              No changelog history found
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Try adjusting your filters
            </Typography>
          </Paper>
        ) : (
          Object.keys(groupedData)
            .sort((a, b) => b - a)
            .map((year) => (
              <Box
                key={year}
                sx={{
                  display: "flex",
                  position: "relative",
                  mb: 4,
                  minHeight: 200,
                }}
              >
                {/* Year - Rotated 90deg, Sticky on left */}
                <Box
                  sx={{
                    width: 50,
                    flexShrink: 0,
                    position: "sticky",
                    top: 20,
                    height: "fit-content",
                    alignSelf: "flex-start",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: 28,
                      color: "#047780",
                      transform: "rotate(-90deg)",
                      transformOrigin: "center center",
                      whiteSpace: "nowrap",
                      letterSpacing: 2,
                      position: "relative",
                      top: 40,
                    }}
                  >
                    {year}
                  </Typography>
                </Box>

                {/* Timeline Content */}
                <Box sx={{ flex: 1, borderLeft: "3px solid #e0e0e0", pl: 3 }}>
                  {Object.keys(groupedData[year]).map((month) => (
                    <Box key={month} sx={{ mb: 3 }}>
                      {/* Month Header - Sticky */}
                      <Box
                        sx={{
                          position: "sticky",
                          top: 0,
                          backgroundColor: "#fff",
                          zIndex: 2,
                          py: 1,
                          mb: 1,
                          borderBottom: "2px solid #047780",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: "#047780",
                          }}
                        >
                          {month}
                        </Typography>
                      </Box>

                      {/* Timeline Container */}
                      <Box sx={{ position: "relative", ml: 2 }}>
                        {/* Vertical Line */}
                        <Box
                          sx={{
                            position: "absolute",
                            left: 50,
                            top: 0,
                            bottom: 0,
                            width: 3,
                            backgroundColor: "#047780",
                            zIndex: 0,
                          }}
                        />

                      {/* Timeline Items */}
                      {groupedData[year][month].map((item, index) => {
                        const dateInfo = formatDate(item.date);
                        return (
                          <Box
                            key={item.id}
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              mb: 4,
                              position: "relative",
                            }}
                          >
                            {/* Date Circle */}
                            <Box
                              sx={{
                                width: 100,
                                height: 100,
                                borderRadius: "50%",
                                border: "3px solid #047780",
                                backgroundColor: "#fff",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 1,
                                flexShrink: 0,
                                boxShadow: "0 2px 8px rgba(4, 119, 128, 0.2)",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: "bold",
                                  fontSize: 22,
                                  lineHeight: 1,
                                  color: "#333",
                                }}
                              >
                                {dateInfo.day}
                              </Typography>
                              <Typography
                                sx={{
                                  fontWeight: "bold",
                                  fontSize: 14,
                                  lineHeight: 1.2,
                                  color: "#333",
                                }}
                              >
                                {dateInfo.month}
                              </Typography>
                              <Typography
                                sx={{
                                  fontWeight: 500,
                                  fontSize: 12,
                                  color: "#047780",
                                }}
                              >
                                {dateInfo.year}
                              </Typography>
                            </Box>

                            {/* Content */}
                            <Box sx={{ ml: 3, pt: 1, flex: 1 }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: "bold",
                                  color: "#333",
                                  mb: 1,
                                }}
                              >
                                {item.title}
                              </Typography>

                              {/* Expandable Description */}
                              <ExpandableDescription
                                description={item.description}
                                maxLines={3}
                              />

                              {/* Video & Doc Links */}
                              {(item.videoUrl || item.docUrl) && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 2,
                                    mt: 1.5,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {item.videoUrl && (
                                    <Box
                                      component="a"
                                      href={item.videoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        px: 1.5,
                                        py: 0.5,
                                        backgroundColor: "#ff4d4f",
                                        color: "#fff",
                                        borderRadius: 1,
                                        fontSize: 13,
                                        fontWeight: 500,
                                        textDecoration: "none",
                                        transition: "all 0.2s",
                                        "&:hover": {
                                          backgroundColor: "#d9363e",
                                          transform: "translateY(-1px)",
                                        },
                                      }}
                                    >
                                      <PlayCircleOutlined style={{ fontSize: 16 }} />
                                      Watch Video
                                    </Box>
                                  )}
                                  {item.docUrl && (
                                    <Box
                                      component="a"
                                      href={item.docUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        px: 1.5,
                                        py: 0.5,
                                        backgroundColor: "#047780",
                                        color: "#fff",
                                        borderRadius: 1,
                                        fontSize: 13,
                                        fontWeight: 500,
                                        textDecoration: "none",
                                        transition: "all 0.2s",
                                        "&:hover": {
                                          backgroundColor: "#035a61",
                                          transform: "translateY(-1px)",
                                        },
                                      }}
                                    >
                                      <FileTextOutlined style={{ fontSize: 16 }} />
                                      View Docs
                                    </Box>
                                  )}
                                </Box>
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))
        )}
      </Box>

      {/* Right Section - Filters */}
      <Box
        sx={{
          width: 280,
          flexShrink: 0,
          backgroundColor: "#f9f9f9",
          borderRadius: 2,
          p: 2.5,
          border: "1px solid #e0e0e0",
          height: "fit-content",
          position: "sticky",
          top: 0,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 3,
            color: "#333",
            borderBottom: "2px solid #047780",
            pb: 1,
          }}
        >
          Filters
        </Typography>

        {/* Year Filter */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: "#555" }}>
            Year
          </Typography>
          <Select
            style={{ width: "100%" }}
            placeholder="Select Year"
            options={yearOptions}
            value={filterYear}
            onChange={(value) => setFilterYear(value)}
            allowClear
          />
        </Box>

        {/* Month Filter */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: "#555" }}>
            Month
          </Typography>
          <Select
            style={{ width: "100%" }}
            placeholder="Select Month"
            options={monthOptions}
            value={filterMonth}
            onChange={(value) => setFilterMonth(value)}
            allowClear
          />
        </Box>

        {/* Date Filter */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: "#555" }}>
            Date
          </Typography>
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Select Date"
            value={filterDate}
            onChange={(date) => setFilterDate(date)}
            format="DD-MM-YYYY"
          />
        </Box>

        {/* Having Filter */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: "#555" }}>
            Having
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Tag
              color={filterHaving.includes("doc") ? "#047780" : "default"}
              style={{
                cursor: "pointer",
                padding: "4px 12px",
                fontSize: 13,
                borderRadius: 16,
              }}
              onClick={() => toggleHaving("doc")}
            >
              <FileTextOutlined style={{ marginRight: 4 }} />
              Doc
            </Tag>
            <Tag
              color={filterHaving.includes("video") ? "#ff4d4f" : "default"}
              style={{
                cursor: "pointer",
                padding: "4px 12px",
                fontSize: 13,
                borderRadius: 16,
              }}
              onClick={() => toggleHaving("video")}
            >
              <PlayCircleOutlined style={{ marginRight: 4 }} />
              Video
            </Tag>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            style={{
              flex: 1,
              height: 36,
            }}
          >
            Reset
          </Button>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            style={{
              flex: 1,
              height: 36,
              backgroundColor: "#047780",
              borderColor: "#047780",
            }}
          >
            Search
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ChangelogHistory;
