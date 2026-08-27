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

const createSchema = z
  .object({
    nombre: z.string().min(1, "Nome é obrigatório"),
    apellido: z.string().min(1, "Sobrenome é obrigatório"),
    telefono: z.string().min(1, "Telefone é obrigatório"),
    correo: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const editSchema = z
  .object({
    nombre: z.string().min(1, "Nome é obrigatório"),
    apellido: z.string().min(1, "Sobrenome é obrigatório"),
    telefono: z.string().min(1, "Telefone é obrigatório"),
    correo: z.string().email("E-mail inválido"),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine((d) => !d.password || d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof createSchema>;

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
  const isEdit = !!editTarget;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
  });

  useEffect(() => {
    if (open)
      reset({
        nombre: editTarget?.nombre ?? "",
        apellido: editTarget?.apellido ?? "",
        telefono: editTarget?.telefono ?? "",
        correo: editTarget?.correo ?? "",
        password: "",
        confirmPassword: "",
      });
  }, [open, editTarget, reset]);

  const handleSave = (data: FormValues) => {
    const password = data.password?.trim()
      ? data.password
      : (editTarget?.password ?? "");
    onSubmit({
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
      correo: data.correo,
      password,
    });
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
          {!viewOnly && (
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                type="password"
                label={isEdit ? "Nova senha (opcional)" : "Senha"}
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <TextField
                fullWidth
                type="password"
                label="Confirmar senha"
                {...register("confirmPassword")}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
            </Stack>
          )}
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
