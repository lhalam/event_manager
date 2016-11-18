var React = require('react');
import moment from 'moment'
import fullCalendar from 'fullcalendar'

export default class Calendar extends React.Component {
      componentDidMount() {
        $('#calendar').fullCalendar({
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,agendaWeek,agendaDay'
                },
                events: function(start, end, timezone, callback) {
                     $.ajax({
                        url: 'api/v1/calendars/',
                        data: {
                        },
                        success: function(doc) {
                            console.log(doc);
                          var events = [];
                          $.each(doc.all_events, function(index, value) {

                            events.push({
                              title: value['title'],
                              start: value['start_date'],
                              end: value['end_date']
                              //all data
                            });
                            console.log(events)
                          });
                          callback(events);
                        },
                        error: function(e, x, y) {
                          console.log(e);
                        }
                    });
                },
                editable: true,
                droppable: true, // this allows things to be dropped onto the calendar
                drop: function() {
                    // is the "remove after drop" checkbox checked?
                    if ($('#drop-remove').is(':checked')) {
                        // if so, remove the element from the "Draggable Events" list
                        $(this).remove();
                    }
                }
        })
      }
      render() {
        return <div id="calendar"></div>;
      }
}
