import { Project } from "../Project";
import { User } from "../User";

export interface ProjectEditModalProps {
  open: boolean;
  project: Project | null;
  users: User[];
  onClose: () => void;
  onSaved: () => void;
}
