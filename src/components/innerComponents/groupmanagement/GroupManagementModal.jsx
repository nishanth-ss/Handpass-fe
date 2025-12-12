import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { Controller } from "react-hook-form";

const GroupManagementModal = ({
    open,
    onClose,
    editingGroup,
    devices,
    controlGroup,
    registerGroup,
    groupErrors,
    handleSubmitGroup,
    saveGroup,
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmitGroup(saveGroup)}>
                <DialogTitle>
                    {editingGroup ? "Edit Group" : "Add Group"}
                </DialogTitle>

                <DialogContent>

                    {/* Group Name */}
                    <TextField
                        label="Group Name"
                        {...registerGroup("group_name")}
                        error={!!groupErrors.group_name}
                        helperText={groupErrors.group_name?.message}
                        fullWidth
                        margin="dense"
                    />

                    {/* Device Select */}
                    <Controller
                        name="device_id"
                        control={controlGroup}
                        render={({ field }) => {
                            const selectedDevice =
                                devices.find((d) => d.id === field.value) || null;

                            return (
                                <Autocomplete
                                    options={devices}
                                    value={selectedDevice}
                                    getOptionLabel={(option) =>
                                        option.sn || ""
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
                                            label="Select Device"
                                            fullWidth
                                            margin="dense"
                                        />
                                    )}
                                />
                            );
                        }}
                    />

                    {/* Description */}
                    <TextField
                        label="Description"
                        {...registerGroup("description")}
                        error={!!groupErrors.description}
                        helperText={groupErrors.description?.message}
                        fullWidth
                        multiline
                        rows={3}
                        margin="dense"
                    />

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

export default GroupManagementModal;
