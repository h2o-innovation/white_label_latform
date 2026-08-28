import { useDraggable } from "@dnd-kit/core";
import { Box, Divider, Typography } from "@mui/material";
import TextFieldsOutlined from "@mui/icons-material/TextFieldsOutlined";
import NumbersOutlined from "@mui/icons-material/NumbersOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import ArrowDropDownCircleOutlined from "@mui/icons-material/ArrowDropDownCircleOutlined";
import LibraryAddCheckOutlined from "@mui/icons-material/LibraryAddCheckOutlined";
import ImageOutlined from "@mui/icons-material/ImageOutlined";
import type { ComponentType } from "../../infrastructure/formBuilderStore";

interface PaletteEntry {
  type: ComponentType;
  label: string;
  icon: React.ReactNode;
}

const groups: { title: string; items: PaletteEntry[] }[] = [
  {
    title: "Campos",
    items: [
      {
        type: "text",
        label: "Texto",
        icon: <TextFieldsOutlined fontSize="small" />,
      },
      {
        type: "number",
        label: "Número",
        icon: <NumbersOutlined fontSize="small" />,
      },
      {
        type: "email",
        label: "E-mail",
        icon: <EmailOutlined fontSize="small" />,
      },
      {
        type: "phone",
        label: "Telefone",
        icon: <PhoneOutlined fontSize="small" />,
      },
      {
        type: "date",
        label: "Data",
        icon: <CalendarTodayOutlined fontSize="small" />,
      },
      {
        type: "select",
        label: "Seleção",
        icon: <ArrowDropDownCircleOutlined fontSize="small" />,
      },
      {
        type: "multiselect",
        label: "Multi-seleção",
        icon: <LibraryAddCheckOutlined fontSize="small" />,
      },
    ],
  },
  {
    title: "Elementos",
    items: [
      {
        type: "image",
        label: "Imagem",
        icon: <ImageOutlined fontSize="small" />,
      },
    ],
  },
];

function DraggableItem({ type, label, icon }: PaletteEntry) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { source: "palette", componentType: type },
  });
  return (
    <Box
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 1,
        mb: 0.5,
        borderRadius: 1,
        cursor: "grab",
        border: "1px solid",
        borderColor: isDragging ? "primary.main" : "divider",
        bgcolor: isDragging ? "primary.50" : "background.paper",
        opacity: isDragging ? 0.4 : 1,
        userSelect: "none",
        "&:hover": { bgcolor: "action.hover", borderColor: "text.disabled" },
      }}
    >
      {icon}
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
}

export function ComponentPalette() {
  return (
    <Box
      sx={{
        width: 220,
        flexShrink: 0,
        bgcolor: "background.paper",
        borderRight: "1px solid",
        borderColor: "divider",
        overflowY: "auto",
        p: 2,
      }}
    >
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ fontWeight: 700 }}
      >
        Componentes
      </Typography>
      {groups.map((group, gi) => (
        <Box key={group.title}>
          {gi > 0 && <Divider sx={{ my: 1.5 }} />}
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ display: "block", mb: 1, mt: gi === 0 ? 1 : 0 }}
          >
            {group.title}
          </Typography>
          {group.items.map((item) => (
            <DraggableItem key={item.type} {...item} />
          ))}
        </Box>
      ))}
    </Box>
  );
}
