import { withNewsroomAuth } from "../../../lib/newsroomAuth";

export default withNewsroomAuth((req, res, user) => {
  res.status(200).json({ user });
});
