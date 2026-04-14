import { deleteField, doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../bin/firebase'
import type { ScheduleRecord } from '../types/schedule'

type ScheduleDocument = {
  record?: ScheduleRecord
  updatedAt?: unknown
}

const SCHEDULE_DOC_ID = 'main'

function scheduleDocRef(uid: string) {
  return doc(db, 'users', uid, 'schedules', SCHEDULE_DOC_ID)
}

export function subscribeUserSchedule(
  uid: string,
  onChange: (record: ScheduleRecord | null, fromCache: boolean) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    scheduleDocRef(uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null, snapshot.metadata.fromCache)
        return
      }
      const data = snapshot.data() as ScheduleDocument
      onChange(data.record ?? {}, snapshot.metadata.fromCache)
    },
    (error) => {
      onError(error)
    },
  )
}

export async function upsertUserScheduleRecord(uid: string, record: ScheduleRecord) {
  await setDoc(
    scheduleDocRef(uid),
    {
      record,
      updatedAt: serverTimestamp(),
    },
  )
}

export async function deleteUserScheduleSlot(uid: string, slotKey: string) {
  await updateDoc(scheduleDocRef(uid), {
    [`record.${slotKey}`]: deleteField(),
    updatedAt: serverTimestamp(),
  })
}
