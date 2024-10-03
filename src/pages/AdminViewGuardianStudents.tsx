import Box from '@mui/material/Box'
import useAuth from '../hooks/useAuth';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { getGuardianList, getStudentsForTable } from '../functions/query';
import { useParams } from 'react-router-dom';
import StudentTable from '../components/StudentTable';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface Guardian {
    userID: string;
    name: string;
    email: string;
    birthday: Timestamp;
}

interface Student {
    userID: string;
    name: string;
    email: string;
    birthday: Timestamp;
}

export default function AdminViewGuardians() {
    const { guardianId } = useParams();
    const { currentUser } = useAuth();
    const [guardians, setGuardians] = useState<Guardian[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const open = Boolean(anchorEl);

    useEffect(() => {
        const fetchGuardians = async () => {
            try {
                const guardianList = await getGuardianList(currentUser?.uid as string);
                setGuardians(guardianList);
            } catch (error) {
                console.error('Error fetching guardians: ', error);
            } finally {
                setLoading(false);
            }
        };
        const fetchStudents = async () => {
            try {
                const studentList = await getStudentsForTable(guardianId as string);
                setStudents(studentList);
            } catch (error) {
                console.error('Error fetching students: ', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGuardians();
        fetchStudents();
    }, [currentUser, guardianId]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement> | null) => {
        if (event) {
            setAnchorEl(event.currentTarget);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Box sx={{ display: 'flex', m: 1 }}>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="with-menu-demo-breadcrumbs"
                >
                    {guardians.map((guardian) => (
                        <MenuItem
                            key={guardian.userID}
                            onClick={handleClose}
                            component={Link}
                            href={`/Home/Admin/${guardian.userID}`}
                        >
                            {guardian.name}
                        </MenuItem>
                    ))}
                </Menu>
                <Breadcrumbs aria-label="breadcrumb"
                    sx={{
                        mt: 5,
                        mr: 10,
                        ml: 10,
                    }}>
                    <Link underline="hover" color="inherit" href={`/Home/Admin`}>
                        Guardians
                    </Link>
                    <IconButton size="small" onClick={handleClick}>
                        {guardians.find((guardian) => guardian.userID === guardianId)?.name}
                        <ArrowDropDownIcon />
                    </IconButton>
                    <Link underline="always" color="inherit">
                        Students
                    </Link>
                </Breadcrumbs>
            </Box>

            <StudentTable students={students} />
        </>
    )
}