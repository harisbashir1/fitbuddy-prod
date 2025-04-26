import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import {format } from 'date-fns';

const WorkoutCalendar = ({ workoutDates }) => {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(`${currentYear}-01-01`);
    const endDate = new Date(`${currentYear}-12-31`);

  // Convert string dates to heatmap values
  const values = workoutDates.map(date => ({ date }));

  return (
    <CalendarHeatmap
      startDate={startDate}
      endDate={endDate}
      values={values}
      classForValue={value => {
        if (!value) return 'color-empty';
        return 'color-github-3';
      }}
      tooltipDataAttrs={value => ({
        
        'data-tip': value.date ? `Workout on ${format(new Date(value.date), 'MMM d')}` : '',
      })}
    />
  );
};

export default WorkoutCalendar;