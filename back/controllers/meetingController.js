import Meeting from "../models/meeting.model.js";
import User from "../models/user.model.js";

// Schedule a new meeting
export const scheduleMeeting = async (req, res) => {
  try {
    const meeting = new Meeting({
      ...req.body,
      createdBy: req.user.id,
    });
    await meeting.save();

    // Notify students and panel members
    await notifyParticipants(meeting);

    res.status(201).json({
      success: true,
      meeting,
      message: "Meeting scheduled successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Get all meetings
export const getAllMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate("students", "username email")
      .populate("panelMembers", "username email")
      .populate("createdBy", "username");

    res.json({
      success: true,
      meetings,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Cancel a meeting
export const cancelMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findByIdAndDelete(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    res.json({
      success: true,
      message: "Meeting cancelled successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Helper function to notify participants
const notifyParticipants = async (meeting) => {
  try {
    // Add notification to students
    await User.updateMany(
      { _id: { $in: meeting.students } },
      {
        $push: {
          notifications: {
            type: "meeting_scheduled",
            message: `New meeting scheduled: ${meeting.title} on ${meeting.date} at ${meeting.time}`,
            referenceId: meeting._id,
            createdAt: new Date(),
          },
        },
      },
    );

    // Add notification to panel members
    await User.updateMany(
      { _id: { $in: meeting.panelMembers } },
      {
        $push: {
          notifications: {
            type: "meeting_scheduled",
            message: `You have a panel meeting: ${meeting.title} on ${meeting.date} at ${meeting.time}`,
            referenceId: meeting._id,
            createdAt: new Date(),
          },
        },
      },
    );
  } catch (err) {
    console.error("Error notifying participants:", err);
  }
};

// Get meetings for supervisor
export const getSupervisorMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      panelMembers: req.user.id,
      status: "scheduled",
    })
      .populate("students", "username email")
      .populate("panelMembers", "username email");

    res.json({ success: true, meetings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get meetings for student
export const getStudentMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({
      students: req.user.id,
      status: "scheduled",
    })
      .populate("students", "username email")
      .populate("panelMembers", "username email");

    res.json({ success: true, meetings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
