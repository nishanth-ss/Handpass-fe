import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getAllDevices } from "../../api/handpassApi";

// Form validation schema
const groupSchema = yup.object().shape({
  group_name: yup.string().required("Group name is required"),
  device_id: yup.string().required("Device is required"),
  description: yup.string().required("Description is required"),
});

const GroupDialog = ({ open, editingGroup, onClose, onSubmit }) => {
  const { handleSubmit, control, reset, register, formState: { errors } } = useForm({
    resolver: yupResolver(groupSchema),
    defaultValues: {
      group_name: editingGroup?.group_name || "",
      device_id: editingGroup?.device_id || "",
      description: editingGroup?.description || "",
    },
  });

  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await getAllDevices(); // your backend API
        setDevices(res.data || []);
      } catch (err) {
        console.error("Failed to fetch devices:", err);
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    if (editingGroup) {
      reset({
        group_name: editingGroup.group_name,
        device_id: editingGroup.device_id,
        description: editingGroup.description,
      });
    } else {
      reset({
        group_name: "",
        device_id: "",
        description: "",
      });
    }
  }, [editingGroup, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{editingGroup ? "Edit Group" : "Add New Group"}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {/* Group Name */}
          <TextField
            label="Group Name"
            fullWidth
            margin="dense"
            variant="outlined"
            {...register("group_name")}
            error={!!errors.group_name}
            helperText={errors.group_name?.message}
            sx={{ mb: 2 }}
          />

          {/* Device Autocomplete */}
          <Controller
            name="device_id"
            control={control}
            render={({ field }) => {
              // Find the selected option object based on field.value (id)
              const selectedDevice = devices.find((d) => d.id === field.value) || null;

              return (
                <Autocomplete
                  options={devices}
                  getOptionLabel={(option) => option.sn || ""}
                  value={selectedDevice} // pass the full object here
                  onChange={(event, value) => field.onChange(value?.id || "")} // save only id
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Device"
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      error={!!errors.device_id}
                      helperText={errors.device_id?.message}
                      sx={{ mb: 2 }}
                    />
                  )}
                />
              );
            }}
          />

          {/* Description */}
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            margin="dense"
            variant="outlined"
            {...register("description")}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {editingGroup ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default GroupDialog;
