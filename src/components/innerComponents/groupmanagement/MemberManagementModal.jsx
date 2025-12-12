import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Select,
} from "@mui/material";
import { Controller } from "react-hook-form";
import Autocomplete from "@mui/material/Autocomplete";

const MemberManagementModal = ({
    open,
    onClose,
    groups,
    getAllUserData,
    controlMember,
    registerMember,
    memberWatch,
    handleSubmitMember,
    handleMemberSubmit,
}) => {
    
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmitMember(handleMemberSubmit)}>
                <DialogTitle>Edit Member</DialogTitle>

                <DialogContent>

                    {/* Group Selector */}
                    {/* <Controller
                        name="group_id"
                        control={controlMember}
                        render={({ field }) => {
                            const selectedGroup =
                                groups.find((g) => g.id === field.value) || null;

                            return (
                                <Autocomplete
                                    options={groups}
                                    value={selectedGroup}
                                    getOptionLabel={(option) =>
                                        option.group_name || ""
                                    }
                                    isOptionEqualToValue={(a, b) =>
                                        a.id === b?.id
                                    }
                                    onChange={(e, value) =>
                                        field.onChange(value?.id || "")
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Group"
                                            margin="dense"
                                            fullWidth
                                        />
                                    )}
                                />
                            );
                        }}
                    /> */}

                    {/* User Selector */}
                    <Controller
                        name="user_id"
                        control={controlMember}
                        render={({ field }) => {
                            const selectedUser =
                                getAllUserData.find(
                                    (u) => u.id === field.value
                                ) || null;

                            return (
                                <Autocomplete
                                    options={getAllUserData}
                                    value={selectedUser}
                                    getOptionLabel={(option) =>
                                        option
                                            ? `${option.name} (${option.user_id})`
                                            : ""
                                    }
                                    isOptionEqualToValue={(a, b) =>
                                        a.id === b?.id
                                    }
                                    onChange={(e, value) =>
                                        field.onChange(value?.id || "")
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select User"
                                            margin="dense"
                                            fullWidth
                                        />
                                    )}
                                />
                            );
                        }}
                    />

                    {/* Status Select */}
                    <Select
                        {...registerMember("is_allowed")}
                        label="Status"
                        value={memberWatch("is_allowed") || "true"}
                        sx={{ width: "200px", mt: 2 }}
                    >
                        <MenuItem value="true">Allowed</MenuItem>
                        <MenuItem value="false">Blocked</MenuItem>
                    </Select>
                </DialogContent>

                <DialogActions>
                    <Button variant="outlined" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default MemberManagementModal;
