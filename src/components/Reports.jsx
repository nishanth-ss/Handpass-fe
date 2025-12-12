import { useEffect, useState } from "react";
import { getAllDevices, getReports } from "../api/handpassApi";
import { Autocomplete, TextField, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { getAllUsers as fetchAllUsers } from "../api/usersApi";  // Rename the import

const Reports = () => {

    const [filters, setFilters] = useState({
        sn: "",
        name: "",
        user_id: "",
        palm_type: "",
        start_date: null,
        end_date: null,
        format: "csv",
    });
    const [snList, setSnList] = useState([]);
    const [nameList, setNameList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [palmTypeList, setPalmTypeList] = useState([]);


    useEffect(() => {
        getAllUsers()
        getAllDevicesData()
    }, []);

    const fetchReports = async (filters) => {
        const customPayload = {
            ...filters,
            user_id: filters.user_id || "",
            start_date: filters.start_date?.toISOString() || "",
            end_date: filters.end_date?.toISOString() || "",
            sn: filters.sn || "",
        };

        try {
            const response = await getReports(customPayload);

            if (response) {
                downloadCSV(response); // ⬅ Download CSV data
            } else {
                alert("No data found!");
            }

        } catch (error) {
            console.log(error);
        }
    };

    const downloadCSV = (csvText) => {
        const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "reports.csv";
        link.click();

        URL.revokeObjectURL(url);
    };

    const getAllDevicesData = async () => {
        try {
            const response = await getAllDevices();
            setSnList(response?.data);
        } catch (error) {
            console.log(error);
        }
    }

    const getAllUsers = async () => {
        try {
            const response = await fetchAllUsers();
            setUserList(response?.data);
        } catch (error) {
            console.log(error);

        }
    }

    const applyFilters = () => {
        fetchReports(filters)
    }
    console.log(filters);


    return (
        <div style={{ padding: 20 }}>

            <h1>Reports</h1>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>

                {/* SN Filter */}
                <Autocomplete
                    options={snList}
                    getOptionLabel={(option) => option.sn || ""}
                    value={filters.sn}
                    onChange={(e, v) => setFilters({ ...filters, sn: v })}
                    renderInput={(params) => <TextField {...params} label="SN" />}
                    sx={{ width: 250 }}
                />

                {/* User ID Filter */}
                <Autocomplete
                    options={userList}
                    getOptionLabel={(option) => option.name || ""}
                    value={filters.user_id}
                    onChange={(e, v) => setFilters({ ...filters, user_id: v })}
                    renderInput={(params) => <TextField {...params} label="User" />}
                    sx={{ width: 250 }}
                />

                {/* Palm Type Filter */}
                {/* <Autocomplete
                    options={palmTypeList}
                    value={filters.palm_type}
                    onChange={(e, v) => setFilters({ ...filters, palm_type: v })}
                    renderInput={(params) => <TextField {...params} label="Palm Type" />}
                    sx={{ width: 250 }}
                /> */}

                {/* Date Range */}
                <DatePicker
                    label="Start Date"
                    value={filters.start_date}
                    onChange={(newDate) =>
                        setFilters({ ...filters, start_date: newDate })
                    }
                />

                <DatePicker
                    label="End Date"
                    value={filters.end_date}
                    onChange={(newDate) =>
                        setFilters({ ...filters, end_date: newDate })
                    }
                />
            </div>

            <Button
                variant="contained"
                onClick={applyFilters}
                sx={{ marginTop: 3 }}
            >
                Download CSV
            </Button>
        </div>
    );
}

export default Reports