import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
    Box,
    Button,
    IconButton,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { useNotification } from '../contexts/NotificationContext';
import {
    getGroups,
    createGroup,
    updateGroup,
} from '../api/groupApi';
import { getAllDevices } from '../api/handpassApi';
import { addGroupMember, getSpecifiGroupMembers, removeGroupMember, updateGroupMember } from '../api/memberApi';

import { useForm } from 'react-hook-form';
import { FaArrowLeftLong } from "react-icons/fa6";
import { getAllUsers } from '../api/usersApi';
import MemberManagementModal from './innerComponents/groupmanagement/MemberManagementModal';
import GroupManagementModal from './innerComponents/groupmanagement/GroupManagementModal';

const GroupManagement = () => {

    // ======= STATES =======
    const [groups, setGroups] = useState([]);
    const [members, setMembers] = useState([]);
    const [devices, setDevices] = useState([]);
    const [getAllUserData, setGetAllUserData] = useState([]);
    const [getGroupID, setGetGroupID] = useState(null);

    const [loading, setLoading] = useState(false);

    const [showGroupTable, setShowGroupTable] = useState(true);

    const [groupDialog, setGroupDialog] = useState(false);
    const [memberDialog, setMemberDialog] = useState(false);

    const [editingGroup, setEditingGroup] = useState(null);
    const [editingMember, setEditingMember] = useState(null);

    const { showNotification } = useNotification();


    // ===== FORM A: GROUP FORM =====
    const {
        register: registerGroup,
        handleSubmit: handleSubmitGroup,
        reset: resetGroup,
        control: controlGroup,
        formState: { errors: groupErrors }
    } = useForm({
        defaultValues: {
            group_name: "",
            description: "",
            device_id: "",
            is_active: true
        }
    });

    // ===== FORM B: MEMBER FORM =====
    const {
        register: registerMember,
        handleSubmit: handleSubmitMember,
        reset: resetMember,
        formState: { errors: memberErrors },
        watch: memberWatch,
        control: controlMember,
    } = useForm({
        defaultValues: {
            // group_id: "",
            user_id: "",
            is_allowed: true
        }
    });


    // ===== FETCH DATA =====
    const fetchGroups = async () => {
        setLoading(true);
        try {
            const res = await getGroups();
            setGroups(res.data || []);
        } catch (error) {
            console.error('Error fetching groups:', error);
            const errorMessage = error.response?.data?.message || 'Failed to load groups';
            showNotification(errorMessage, "error");

            // If unauthorized, redirect to login
            if (error.response?.status === 401) {
                // The interceptor should handle this, but just in case
                // localStorage.removeItem('authToken');
                // window.location.href = '/login';
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async (groupID) => {
        try {
            const res = await getSpecifiGroupMembers(groupID);
            setMembers(res.data || []);
        } catch (error) {
            console.error('Error fetching members:', error);
            const errorMessage = error.response?.data?.message || 'Failed to load group members';
            showNotification(errorMessage, "error");

            // If unauthorized, redirect to login
            if (error.response?.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }

            // Return empty array to prevent undefined errors
            return [];
        }
    };

    const fetchDevices = async () => {
        try {
            const res = await getAllDevices();
            setDevices(res.data || []);
        } catch (error) {
            console.error('Error fetching devices:', error);
            const errorMessage = error.response?.data?.message || 'Failed to load devices';
            showNotification(errorMessage, "error");

            // If unauthorized, redirect to login
            if (error.response?.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }

            // Return empty array to prevent undefined errors
            return [];
        }
    };

    const fetchAllUsers = async () => {
        try {
            const res = await getAllUsers();
            setGetAllUserData(res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            const errorMessage = error.response?.data?.message || 'Failed to load users';
            showNotification(errorMessage, "error");

            // If unauthorized, redirect to login
            if (error.response?.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }
        }
    }


    useEffect(() => {
        fetchGroups();
        fetchDevices();
        fetchAllUsers();
    }, []);


    // =======================
    //   GROUP CRUD HANDLERS
    // =======================

    const openAddGroup = () => {
        resetGroup({
            group_name: "",
            description: "",
            device_id: "",
            is_active: true
        });
        setEditingGroup(null);
        setGroupDialog(true);
    };

    const openEditGroup = (group) => {
        setEditingGroup(group);
        resetGroup({
            group_name: group.group_name,
            description: group.description,
            device_id: group.devices?.[0]?.device_id || "",
            is_active: group.is_active
        });
        setGroupDialog(true);
    };

    const saveGroup = async (data) => {
        try {
            if (editingGroup) {
                await updateGroup(editingGroup.id, data);
                showNotification("Group updated", "success");
            } else {
                await createGroup(data);
                showNotification("Group created", "success");
            }
            setGroupDialog(false);
            fetchGroups();
        } catch {
            showNotification("Failed to save group", "error");
        }
    };


    // ========================
    //  MEMBER CRUD HANDLERS
    // ========================

    const openAddGroupMember = () => {
        resetMember({
            // group_id: "",
            user_id: "",
            is_allowed: true
        });
        setEditingMember(null);
        setMemberDialog(true);
    }

    const openEditMember = (member) => {
        setEditingMember(member);
        resetMember({
            // group_id: String(member.group_id),
            user_id: String(member.user_id),
            is_allowed: member.is_allowed ? "true" : "false"
        });
        setMemberDialog(true);
    };

    const handleMemberSubmit = async (data) => {
        try {
            if (editingMember) {
                await updateGroupMember(editingMember.id, { ...data, group_id: getGroupID });
                showNotification('Member updated successfully', 'success');
            } else {
                await addGroupMember({ ...data, group_id: getGroupID });
                showNotification('Member added successfully', 'success');
            }
            setMemberDialog(false);
            fetchMembers(getGroupID);
        } catch (error) {
            console.error('Error saving member:', error);
            showNotification(`Failed to ${editingMember ? 'update' : 'add'} member`, 'error');
        }
    };

    // const updateWiegandFlag = async (row, value) => {

    //     try {
    //         await updateGroupMember(row?.id, { wiegand_flag: value, group_id: row?.group_id, user_id: row?.user_id });
    //         fetchMembers(getGroupID);
    //         showNotification("Permission updated", "success");
    //     } catch (e) {
    //         console.error("Update failed", e);
    //         showNotification("Failed to update permission", "error");
    //     }
    // };


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this member from the group?')) {
            try {
                await removeGroupMember(id);
                showNotification('Member removed successfully', 'success');
                fetchMembers(getGroupID);
            } catch (error) {
                console.error('Error removing member:', error);
                showNotification('Failed to remove member', 'error');
            }
        }
    };

    // ====================
    // TABLE COLUMNS
    // ====================

    const groupColumns = [
        {
            field: "group_name",
            headerName: "Group Name",
            flex: 1,
            renderCell: (params) => {
                const sn = params.row.devices?.[0]?.sn || "No SN";
                return (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>{params.value} - <strong>{sn}</strong></span>
                    </div>
                );
            }
        },
        { field: "description", headerName: "Description", flex: 2 },
        {
            field: "actions",
            headerName: "Actions",
            width: 190,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => openEditGroup(params.row)}>
                        <EditIcon color="primary" />
                    </IconButton>

                    <IconButton onClick={() => alert("delete")}>
                        <DeleteIcon color="error" />
                    </IconButton>

                    <Button size="small" variant='contained' color='success' onClick={() => { setShowGroupTable(false); setGetGroupID(params.row.id); fetchMembers(params.row.id); }}>
                        + Add
                    </Button>
                </>
            )
        }
    ];

    const memberColumns = [
        { field: "group_name", headerName: "Group", flex: 1, renderCell: (params)=>{
            console.log(params);
            
            return (
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{params.value}</span>
                </div>
            )
        } },
        { field: "name", headerName: "User", flex: 1 },
        {
            field: "is_allowed", headerName: "Status", flex: 1,

            renderCell: (params) => (
                params.value ? (
                    <span style={{ color: 'green', fontWeight: 'bold' }}>Allowed</span>) : (
                    <span style={{ color: 'red', fontWeight: 'bold' }}>Blocked</span>
                )
            )
        },
        // {
        //     field: "wiegand_flag",
        //     headerName: "Access Control Permission",
        //     flex:1,
        //     renderCell: (params) => {
        //         return (
        //             <Select
        //                 value={params.value}
        //                 onChange={(e) => {
        //                     const newValue = e.target.value;
        //                     updateWiegandFlag(params.row, newValue); 
        //                 }}
        //                 size="small"
        //                 sx={{
        //                     "& .MuiSelect-select": {
        //                         padding: "4px 8px",
        //                         fontSize: "14px",
        //                         color: params.value === 1 ? "green" : "#999",
        //                     },
        //                     "& .MuiOutlinedInput-notchedOutline": {
        //                         border: "none",
        //                     },
        //                     "&:hover .MuiOutlinedInput-notchedOutline": {
        //                         border: "1px solid #ddd",
        //                     },
        //                 }}
        //             >
        //                 <MenuItem value={1} sx={{ color: "green" }}>Yes</MenuItem>
        //                 <MenuItem value={0} sx={{ color: "#999" }}>No</MenuItem>
        //             </Select>
        //         );
        //     },
        // },
        // {
        //     field: "admin_auth", headerName: "Admin Permission",
        //     flex:1,
        //     renderCell: (params) => {
        //         return (
        //             <Select
        //                 value={params.value}
        //                 onChange={(e) => handleWiegandChange(params.row.id, e.target.value)}
        //                 size="small"
        //                 sx={{
        //                     '& .MuiSelect-select': {
        //                         padding: '4px 8px',
        //                         fontSize: '14px',
        //                         color: params.value === 1 ? 'green' : '#999'
        //                     },
        //                     '& .MuiOutlinedInput-notchedOutline': {
        //                         border: 'none'
        //                     },
        //                     '&:hover .MuiOutlinedInput-notchedOutline': {
        //                         border: '1px solid #ddd'
        //                     }
        //                 }}
        //             >
        //                 <MenuItem value={1} sx={{ color: 'green' }}>Yes</MenuItem>
        //                 <MenuItem value={0} sx={{ color: '#999' }}>No</MenuItem>
        //             </Select>
        //         )
        //     }
        // },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => openEditMember(params.row)}>
                        <EditIcon color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id)}>
                        <DeleteIcon color="error" />
                    </IconButton>
                </>
            )
        }
    ];


    return (
        <Box sx={{ p: 2 }}>

            {/* ============ HEADER ============ */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <h2>{showGroupTable ? "Group Management" : "Group Member Management"}</h2>

                {showGroupTable ? (
                    <Button variant="contained" sx={{ height: "40px" }} startIcon={<AddIcon />} onClick={openAddGroup}>
                        Add Group
                    </Button>
                ) :
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        sx={{ height: "40px" }}
                        onClick={openAddGroupMember}
                    >
                        Add Member
                    </Button>
                }
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                {!showGroupTable && (
                    <Button variant="outlined" sx={{ display: "flex", gap: 1, alignItems: "center" }} onClick={() => setShowGroupTable(true)}><FaArrowLeftLong /> Back</Button>
                )}
                {/* <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchGroups}>
                    Refresh
                </Button> */}
            </Box>


            {/* ============ TABLES ============ */}

            {showGroupTable ? (
                <DataGrid
                    rows={groups}
                    columns={groupColumns}
                    getRowId={(r) => r.id}
                    autoHeight
                    disableRowSelectionOnClick
                    disableSelectionOnClick
                    sx={{
                        '& .MuiDataGrid-cell:focus': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-columnHeader:focus': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-cell:focus-within': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-row.Mui-selected': {
                            backgroundColor: 'inherit !important',
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: 'rgba(0,0,0,0.02)', // optional hover style
                        },
                    }}
                />) : (
                <DataGrid rows={members} columns={memberColumns} getRowId={(r) => r.id} autoHeight
                    disableRowSelectionOnClick
                    disableSelectionOnClick
                    sx={{
                        '& .MuiDataGrid-cell:focus': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-columnHeader:focus': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-cell:focus-within': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-row.Mui-selected': {
                            backgroundColor: 'inherit !important',
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: 'rgba(0,0,0,0.02)', // optional hover style
                        },
                    }}
                />
            )}


            {/* ======================================================
                     GROUP FORM DIALOG
            ====================================================== */}
            <GroupManagementModal
                open={groupDialog}
                onClose={() => setGroupDialog(false)}
                editingGroup={editingGroup}
                devices={devices}
                controlGroup={controlGroup}
                registerGroup={registerGroup}
                groupErrors={groupErrors}
                handleSubmitGroup={handleSubmitGroup}
                saveGroup={saveGroup}
            />



            {/* ======================================================
                     MEMBER FORM DIALOG
            ====================================================== */}

            <MemberManagementModal
                open={memberDialog}
                onClose={() => {
                    setMemberDialog(false);
                    resetMember();
                    setEditingMember(null);
                }}
                groups={groups}
                getAllUserData={getAllUserData}
                controlMember={controlMember}
                registerMember={registerMember}
                memberWatch={memberWatch}
                handleSubmitMember={handleSubmitMember}
                handleMemberSubmit={handleMemberSubmit}
            />
        </Box>
    );
};

export default GroupManagement;
