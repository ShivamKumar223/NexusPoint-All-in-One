import { useAuth } from '../../context/AuthContext';
import { IoBusiness, IoPersonOutline, IoShieldCheckmarkOutline, IoBriefcaseOutline } from 'react-icons/io5';
import './OrgInfo.css';

const OrgInfo = () => {
  const { user, getRole } = useAuth();
  console.log(user);
  if (!user) return null;

  const role = getRole();
  const isMasterAdmin = role === 'master-Admin';

  return (
    <div className="org-info-card">
      <div className="org-info-header">
        <IoBusiness size={20} />
        <span>Organization Info</span>
      </div>
      <div className="org-info-body">
        <div className="org-info-row">
          <span className="org-info-label"><IoBusiness size={14} /> Organization</span>
          <span className="org-info-value">{user.organizationId.organizationName || 'N/A'}</span>
        </div>
        {!isMasterAdmin && (
          <>
            <div className="org-info-row">
              <span className="org-info-label"><IoPersonOutline size={14} /> Member ID</span>
              <span className="org-info-value org-info-monospace">{user.memberId || 'N/A'}</span>
            </div>
            <div className="org-info-row">
              <span className="org-info-label"><IoBriefcaseOutline size={14} /> Designation</span>
              <span className="org-info-value">{user.designation || 'N/A'}</span>
            </div>
          </>
        )}
        <div className="org-info-row">
          <span className="org-info-label"><IoShieldCheckmarkOutline size={14} /> Role</span>
          <span className={`badge badge-role ${role?.toLowerCase().replace('-', '')}`}>{role}</span>
        </div>
        {user.skills && user.skills.length > 0 && (
          <div className="org-info-skills">
            <span className="org-info-label">Skills</span>
            <div className="org-info-skill-tags">
              {user.skills.map((skill, i) => (
                <span key={i} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgInfo;
