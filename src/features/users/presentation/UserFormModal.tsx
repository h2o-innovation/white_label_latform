import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
} from "@mui/material";
import type { User, UserFormData } from "../infrastructure/usersStore";

const schema = z.object({
  nombre: z.string().min(1, "Nome é obrigatório"),
  apellido: z.string().min(1, "Sobrenome é obrigatório"),
  telefono: z.string().min(1, "Telefone é obrigatório"),
  correo: z.string().email("E-mail inválido"),
});

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  editTarget?: User | null;
  viewOnly?: boolean;
}

export function UserFormModal({
  open,
  onClose,
  onSubmit,
  editTarget,
  viewOnly = false,
}: UserFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open)
      reset(
        editTarget ?? { nombre: "", apellido: "", telefono: "", correo: "" },
      );
  }, [open, editTarget, reset]);

  const handleSave = (data: UserFormData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {viewOnly
          ? "Visualizar usuário"
          : editTarget
            ? "Editar usuário"
            : "Novo usuário"}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Nome"
              disabled={viewOnly}
              {...register("nombre")}
              error={!!errors.nombre}
              helperText={errors.nombre?.message}
            />
            <TextField
              fullWidth
              label="Sobrenome"
              disabled={viewOnly}
              {...register("apellido")}
              error={!!errors.apellido}
              helperText={errors.apellido?.message}
            />
          </Stack>
          <TextField
            fullWidth
            label="Telefone"
            disabled={viewOnly}
            {...register("telefono")}
            error={!!errors.telefono}
            helperText={errors.telefono?.message}
          />
          <TextField
            fullWidth
            label="E-mail"
            disabled={viewOnly}
            {...register("correo")}
            error={!!errors.correo}
            helperText={errors.correo?.message}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {viewOnly ? (
          <Button onClick={onClose} color="inherit">
            Fechar
          </Button>
        ) : (
          <>
            <Button onClick={onClose} color="inherit">
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSubmit(handleSave)}>
              Salvar
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
