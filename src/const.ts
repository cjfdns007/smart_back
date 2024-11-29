export const sensorTypes = ['heartRate', 'medicine', 'outdoor', 'walking'];
export const sensorQuery: { [key: string]: string } = {
    heartRate: 'heartRate(elderlyID, time, heartRate)',
    medicine: 'medicine(elderlyID, time, open)',
    outdoor: 'outdoor(elderlyID, time, outdoor)',
    walking: 'walking(elderlyID, time, walk)',
};
export const sensorDateRange: { [key: string]: number } = {
    heartRate: 60 * 60 * 24,
    medicine: 60 * 60 * 24 * 7,
    outdoor: 60 * 60 * 24 * 7,
    walking: 60 * 60 * 24 * 7,
};
export const sensorValueName: { [key: string]: string } = {
    heartRate: 'heartRate',
    medicine: 'open',
    outdoor: 'outdoor',
    walking: 'walk',
};
