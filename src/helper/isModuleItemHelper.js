export default function isModuleItem(self) {
  return self._id.slice(0, 2) === "__";
}
